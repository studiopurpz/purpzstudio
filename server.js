const express = require('express')
const app = express()
const stripe = require('stripe')(process.env.STRIPE_KEY)
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser') // do webhooka

const RES_FILE = path.join(__dirname, 'reservations.json')
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

console.log("Stripe key:", process.env.STRIPE_KEY ? "OK" : "BRAK");
console.log("Webhook secret:", process.env.WEBHOOK_SECRET ? "OK" : "BRAK");

// helper do odczytu rezerwacji
function readReservations(){
  try {
    if(!fs.existsSync(RES_FILE)) return {}
    const data = fs.readFileSync(RES_FILE, 'utf8')
    if(!data) return {}
    return JSON.parse(data)
  } catch(err){
    console.error("Błąd w readReservations:", err)
    return {}
  }
}

// helper do zapisu
function saveReservations(reservations){
  fs.writeFileSync(RES_FILE, JSON.stringify(reservations, null, 2))
}

// endpoint frontend pobiera wszystkie rezerwacje
app.get('/api/reservations', express.json(), (req,res)=>{
  const reservations = readReservations()
  res.json(reservations)
})

// endpoint do tworzenia checkout session (tylko Stripe)
app.post('/create-checkout-session', express.json(), async (req, res) => {
  const { startDate, startHour, endDate, endHour, totalPrice } = req.body
  if(!startDate || !startHour || !endDate || !endHour || !totalPrice){
    return res.status(400).json({ error: 'Brak danych rezerwacji' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: { name: `Rezerwacja ${startDate} ${startHour} → ${endDate} ${endHour}` },
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://purpzstudio.pl/success.html',
      cancel_url: 'https://purpzstudio.pl/cancel.html',
      metadata: { startDate, startHour, endDate, endHour }
    })

    res.json({ url: session.url })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

// 🔹 Webhook Stripe — tylko surowe body
app.post('/webhook', bodyParser.raw({type:'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET)
  } catch (err) {
    console.log("Webhook Error:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if(event.type === 'checkout.session.completed'){
    const session = event.data.object
    const { startDate, startHour, endDate, endHour } = session.metadata

    const reservations = readReservations()
    let start = new Date(startDate + 'T' + startHour)
    let end = new Date(endDate + 'T' + endHour)
    if(end <= start) end = new Date(start.getTime() + 60*60*1000)

while(start < end){
  const d = start.toISOString().split('T')[0]
  const hStart = start.getHours().toString().padStart(2,'0') + ":00"
  const nextHour = new Date(start.getTime() + 60*60*1000)
  const hEnd = nextHour.getHours().toString().padStart(2,'0') + ":00"

  if(!reservations[d]) reservations[d] = []
  reservations[d].push({ start: hStart, end: hEnd })

  start = nextHour
}

    saveReservations(reservations)
    console.log(`Zapisano rezerwację po płatności: ${session.id}`)
  }

  res.json({received:true})
})

// 🔹 Tutaj zmiana dla Render
const PORT = process.env.PORT || 4242
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))
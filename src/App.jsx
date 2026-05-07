import React from 'react'
import { Nav, Hero, Categories } from './hero.jsx'
import { ProductGrid, ClassesGrid } from './products.jsx'
import { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal } from './sections.jsx'
import { useCartContext } from './CartContext.jsx'

const App = () => {
  const accent = '#f08a8a'
  const h = "Hand-made,\nwith love."
  const s = "A little studio of three crafts — paper, candles, and polymer clay — all small-batch, all made by hand at the same kitchen table."

  const { count } = useCartContext()
  const [cartOpen, setCartOpen] = React.useState(false)
  const [bookingFor, setBookingFor] = React.useState(null)

  return (
    <React.Fragment>
      <Nav accent={accent} cartCount={count()} onOpenCart={() => setCartOpen(true)}/>
      <Hero headline={h} sub={s} accent={accent}/>
      <Categories accent={accent}/>
      <ProductGrid accent={accent}/>
      <ClassesGrid accent={accent} onBook={setBookingFor}/>
      <About accent={accent}/>
      <Newsletter accent={accent}/>
      <InstagramStrip/>
      <Footer/>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} accent={accent}/>
      <BookingModal klass={bookingFor} onClose={() => setBookingFor(null)} accent={accent}/>
    </React.Fragment>
  )
}

export default App

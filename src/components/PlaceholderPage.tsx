import './PlaceholderPage.css'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
    </div>
  )
}

export default PlaceholderPage

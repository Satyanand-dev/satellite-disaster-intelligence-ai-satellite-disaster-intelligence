import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function Indices() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="NDVI / NDWI Analysis"
      description={`Spectral index visualizations, difference maps and statistics for event ${eventId}.`}
    />
  )
}

import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function RiskMap() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="Risk Map"
      description={`Interactive GIS map with flood extent, risk zones and layers for event ${eventId}.`}
    />
  )
}

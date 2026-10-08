import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function Analysis() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="Disaster Analysis"
      description={`Detected disaster type, confidence, affected area and severity for event ${eventId}.`}
    />
  )
}

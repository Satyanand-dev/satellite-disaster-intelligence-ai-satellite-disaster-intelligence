import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function ChangeDetection() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="Change Detection"
      description={`Before/after comparison, change percentage and affected polygons for event ${eventId}.`}
    />
  )
}

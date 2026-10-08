import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function Infrastructure() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="Infrastructure Impact"
      description={`Buildings, roads and critical infrastructure affected in event ${eventId}.`}
    />
  )
}

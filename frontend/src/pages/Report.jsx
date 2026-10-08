import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function Report() {
  const { eventId } = useParams()
  return (
    <PageStub
      title="AI Emergency Report"
      description={`AI-generated situation report with response priorities and PDF export for event ${eventId}.`}
    />
  )
}

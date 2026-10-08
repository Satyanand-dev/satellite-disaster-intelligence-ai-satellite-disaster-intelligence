import { useParams } from 'react-router-dom'
import PageStub from '../components/layout/PageStub.jsx'

export default function Processing() {
  const { jobId } = useParams()
  return (
    <PageStub
      title="Processing"
      description={`Live pipeline progress for job ${jobId} across all analysis stages.`}
    />
  )
}

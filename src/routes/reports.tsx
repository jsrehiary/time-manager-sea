import Layout from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Layout>
        <h1>Reports</h1>
      </Layout>
    </>
  )
}

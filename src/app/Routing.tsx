import { Layout } from "@/pages/LayoutPage"
import { StoryPage } from "@/pages/StoryPage"
import { NotFound } from "@/pages/NotFoundPage"
import { Route, Routes } from "react-router-dom"

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<StoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default Routing

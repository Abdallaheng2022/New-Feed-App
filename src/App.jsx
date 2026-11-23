import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css'
import './index.css'
import NewsFeed from './components/NewsFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient()
function App() {
  
  return (
   
    <QueryClientProvider client={queryClient}>
    <NewsFeed/>
  </QueryClientProvider>
   
   
  )
}

export default App

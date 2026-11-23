import { StyledCard } from './StyledCard';
import { Skeleton } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

function LoadingArticles(){
return ( 
<StyledCard>    
    <CardActionArea>
    <CardContent>
      <Skeleton variant="text" sx={{fontSize:"5rem"}}/>
      <Skeleton variant="text" sx={{fontSize:"1.5rem"}}/>
    </CardContent>
    </CardActionArea> 
    <CardContent>
      <Skeleton variant="text" width={200} sx={{fontSize:"1.5rem"}}/>
      <Skeleton variant="text" width={200} sx={{fontSize:"1.5rem"}}/>
    </CardContent>  

  </StyledCard>);

}


export default LoadingArticles;
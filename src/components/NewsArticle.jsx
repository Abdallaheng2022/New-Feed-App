import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
/** Wrapper is to style card with changing the left and right margin the material design */
import { StyledCard } from './StyledCard';
function NewsArticle(props){
const {title,
    description,
    image,
    author,
    publishedAt,url} = props;

return(
  <StyledCard>
    <a className="no-underline --color-black" href={url}>
    <CardActionArea>
    { image && <CardMedia component="img" height="400" width="150" src={image} alt="sample article"/>}
    <CardContent>
       <Typography variant="h6" component="div" gutterBottom>{title}</Typography>
       <Typography variant="body2" color="textSecondary">{description}</Typography>
    </CardContent>
    </CardActionArea> 
    </a>
    <CardContent>
       <Typography variant="caption"  component="p" color="textSecondary">Author:{author}</Typography>
       <Typography variant="caption"  componen="p" color="textSecondary">{new Date(publishedAt).toLocaleDateString()}</Typography>
    </CardContent>  

  </StyledCard> 
);


}
export default NewsArticle;

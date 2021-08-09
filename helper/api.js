import axios from "axios";
export const githublist=async()=>{
    try {
        const uri = encodeURI(
            `https://api.github.com/users/ranggaaprilio/repos?per_page=8&sort=created:asc`
          );
          
      
          const gitHubResponse = await axios.get(uri);
          return {success:true,data:gitHubResponse.data}
        
    } catch (error) {
        console.log(error.message);
        return {success:true,data:[]}
    }
}
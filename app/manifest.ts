import type { MetadataRoute } from 'next';
import { siteDescription } from '@/lib/seo';
export default function manifest(): MetadataRoute.Manifest {
 return { name:'সহজ কোরআন', short_name:'সহজ কোরআন', start_url:'/', scope:'/', display:'standalone', background_color:'#f7f8f4', theme_color:'#176b50', description:siteDescription, icons:[{src:'/quran.png',type:'image/png',sizes:'512x512',purpose:'any maskable'}], categories:['education','books','lifestyle'], lang:'bn-BD' };
}

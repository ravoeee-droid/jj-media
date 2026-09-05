module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  res.setHeader('Set-Cookie',[
    'jj_gsc_refresh=; HttpOnly; Secure; SameSite=Lax; Path=/api/google; Max-Age=0'
  ]);
  return res.status(200).json({ok:true});
};

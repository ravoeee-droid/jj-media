module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  return res.status(200).json({
    ok:true,
    integrations:{
      clarity:{configured:true,project:'ydfcroc44j'},
      posthog:{configured:Boolean(process.env.POSTHOG_PROJECT_KEY)},
      searchConsole:{
        oauthConfigured:Boolean((process.env.GOOGLE_OAUTH_CLIENT_ID || '818290069312-8q2go2g0uokr6bhei8paijha2cbv5129.apps.googleusercontent.com') && process.env.GOOGLE_OAUTH_CLIENT_SECRET),
        property:process.env.GSC_PROPERTY || 'sc-domain:jj-media-design.de',
        persistentToken:Boolean(process.env.GSC_REFRESH_TOKEN)
      },
      quality:{lychee:true,unlighthouse:true,lighthouseCI:true}
    }
  });
};

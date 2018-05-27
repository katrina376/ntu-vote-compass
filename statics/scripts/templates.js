/* Result Display */

const displayCandidateTemplate = (rank, score, candidate) => {
  let identity = (
    ((candidate.region) ? candidate.region : '') + ' ' +
    candidate.number + ' 號'
  );

  return (
    '<section>' +
    '<h2><span>第 ' + rank + ' 名：' + candidate.name +
    '，相似度 ' + (Math.round(score * 100) / 100) + ' %！</span></h2>' +
    '<p>這位是' + identity + '候選人' +
    '，公報連結<a target="_blank" href="' + candidate.link +
    '">在此</a>。</p>' +
    '<h3>這位候選人認為...</h3>' +
    '<p>' + nl2br(candidate.description) + '</p>' +
    '</section>'
  )
}

const remainCandidateTemplate = (candidate) => {
  let identity = (
    ((candidate.region) ? candidate.region : '') + ' ' +
    candidate.number + ' 號'
  );

  return (
    '<li>' + identity + '候選人：' + candidate.name + '。</li>'
  )
}

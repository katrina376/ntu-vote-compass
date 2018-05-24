const distance = (user, candidate) => {
  /* Damerau–Levenshtein Distance */
  /* https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance */

  // Trivial
  if (!user) return candidate ? candidate.length : 0;
  else if (!candidate) return user.length;

  // Initialize
  const uDimLen = user.length + 2;
  const cDimLen = candidate.length + 2;
  const maxDist = user.length + candidate.length;

  let dist = new Array(uDimLen).fill(0).map(() => new Array(cDimLen).fill(0));
  let da = {};

  dist[0][0] = maxDist;

  for (let i = 0; i < uDimLen - 1; i++) {
    dist[i + 1][0] = maxDist;
    dist[i + 1][1] = i;
    da[user[i]] = 0;
  }
  for (let j = 0; j < cDimLen - 1; j++) {
    dist[0][j + 1] = maxDist;
    dist[1][j + 1] = j;
    da[candidate[j]] = 0;
  }

  // Calculate
  for (let i = 1; i < uDimLen - 1; i++) {
    let db = 0;
    for (let j = 1; j < cDimLen - 1; j++) {
      // index shift
      let k = da[candidate[j - 1]];
      let l = db;

      // index shift
      let cost = (user[i - 1] === candidate[j - 1]) ? 0 : 1;
      db = (user[i - 1] === candidate[j - 1]) ? j : db;

      // index shift
      dist[i + 1][j + 1] = Math.min(
        dist[i][j] + cost,                         // substitution
        dist[i + 1][j] + 1,                        // insertion
        dist[i][j + 1] + 1,                        // deletion
        dist[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }

    // index shift
    da[user[i - 1]] = i;
  }

  return 1 - (dist[uDimLen - 1][cDimLen - 1] / (user.length * (user.length - 1) / 2));
}

const overlap = (user, candidate) => {
  let matchCount = 0;

  for (let i in user) {
    for (let j in candidate) {
      if (user[i] === candidate[j]) {
        matchCount++;
      }
    }
  }

  return matchCount / user.length;
}

const similarity = (ruler, neutral, user, candidate) => {
  let range = ruler[ruler.length - 1] - ruler[0];
  let dist = Math.abs(Number(user) - Number(candidate));

  if (neutral) {
    return (user === neutral) ? -1 : 1 - (dist / range);
  } else {
    return 1 - (dist / range);
  }
}

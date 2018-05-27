const runLoading = (el) => {
  el.style.display = 'block';
  el.innerHTML = 'Loading';
  let clock = setInterval(() => el.innerHTML += '.', 1000);
  return clock;
}

const stopLoading = (clock, el) => {
  clearInterval(clock);
  el.style.display = 'none';
  el.innerHTML = '';
  return;
}

const processCandidate = (data) => {
  ret = [];

  data.forEach((row) => {
    insert = {}
    for (var k in row) {
      if (row[k].indexOf(',') > -1) {
        insert[k] = row[k].split(',');
      } else {
        insert[k] = row[k];
      }
    };
    ret.push(insert);
  });

  return ret;
}

const toggleButton = (button) => {
  if (button.getAttribute('data-selected') === 'true') {
    button.removeAttribute('data-selected');
  } else {
    button.setAttribute('data-selected', 'true');
  }
}

const bindButtonBehavior = (section) => {
  let fieldset = $('fieldset', section);
  let buttonSet = Array.from($$('.button', fieldset));

  buttonSet.forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();

      buttonSet.map((b) => b.removeAttribute('data-selected'));

      let button = getButton(ev.target);
      toggleButton(button);
    });
  });
}

const bindButtonLimit = (section) => {
  let config = parseConfig(section);
  let fieldset = $('fieldset', section);

  Array.from($$('.button', section)).forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();

      let button = getButton(ev.target);
      toggleButton(button);

      let selectedSet = $$('.button[data-selected=true]', section);

      if ((config.upperBound) && (selectedSet.length > config.upperBound)) {
        alert('已超過可選上限！請先取消選擇其他選項才可以再選喔！');
        toggleButton(button);
      }
    });
  });
}

const bindRankLimit = (section) => {
  const inputSet = Array.from($$('input[type=number]', section))
  inputSet.forEach((input) => {
    input.setAttribute('max', inputSet.length);

    input.addEventListener('change', (ev) => {
      if ((ev.target.value < 1) || (ev.target.value > inputSet.length)) {
        alert('不能填入 1~' + inputSet.length + ' 以外的數字，請更正。');
        ev.target.value = '';
      } else {
        let dulplicated = inputSet
          .filter((el) => el.value === ev.target.value);

        if (dulplicated.length > 1) {
          alert('本題組已有排名第 ' + ev.target.value + ' 的選項，請更正。');
          ev.target.value = '';
        }
      }
    });
  });
}

const initializeView = () => {
  Array.from($$('fieldset.inline')).forEach((el) => {
    if ($$('.button', el).length === 3) {
      el.className += ' elements-3';
    } else if ($$('.button', el).length === 4) {
      el.className += ' elements-4';
    } else if ($$('.button', el).length === 5) {
      el.className += ' elements-5';
    }
  })

  Array.from($$('#test-render section')).forEach((el) => {
    let config = parseConfig(el);

    if (!config) {
      return;
    }

    if (config.type === 'level') {
      bindButtonBehavior(el);
    } else if (config.type === 'choice') {
      if (config.upperBound === 1) {
        bindButtonBehavior(el);
      } else {
        bindButtonLimit(el);
      }
    } else if (config.type === 'rank') {
      bindRankLimit(el);
    }
  });

  return;
}

const initializeSubmit = (candidates) => {
  $('#test form').addEventListener('submit', (ev) => {
    ev.preventDefault();

    /* Reset results */
    $('#result').style.display = 'none';
    $('#result-render').innerHTML = '';

    const sections = Array.from($$('section', ev.target));

    /* Validate the filled answers */
    let pass = true;
    for (let i in sections) {
      let error = validate(sections[i]);
      if (error) {
        pass = false;
        alert($('h2', sections[i]).innerText + '填寫有誤喔！' + error + '。');
        break;
      };
    }

    if (!pass) {
      return;
    }

    /* Get filters by list if set in configuration */
    let filters = {};

    sections.forEach((section) => {
      let config = parseConfig(section);

      if (config) {
        if ((config.type === 'list') && (parseFilled(section) !== '*')) {
          filters[config.name] = parseFilled(section);
        }
      }
    });

    let scores = {};

    candidates.forEach((candidate) => {
      if (candidate.name) {
        scores[candidate.name] = 0;
        let base = 0;

        sections.forEach((section) => {
          let score = calculate(section, candidate);
          if (score) {
            base += 1;
            scores[candidate.name] += score;
          }
        });

        scores[candidate.name] = scores[candidate['name']] * 100 / base;
      }
    });

    let holder = Object.keys(scores).map(
      (key) => {return {name: key, score: scores[key]}});
    holder = holder.sort(
      (a, b) => ((a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0)));

    renderResults(holder, candidates, filters);
    $('#result').style.display = 'block';
  });
}

const initializeDisplayNoAnswer = (candidates) => {
  $('#test form').addEventListener('submit', (ev) => {
    ev.preventDefault();

    let holder = $('#no-answer-render');
    holder.innerHTML = '';

    /* Get filters by list if set in configuration */
    let filters = {};

    const sections = Array.from($$('section', ev.target));
    sections.forEach((section) => {
      let config = parseConfig(section);

      if (config) {
        if ((config.type === 'list') && (parseFilled(section) !== '*')) {
          filters[config.name] = parseFilled(section);
        }
      }
    });

    candidates.forEach((candidate) => {
      let qualified = (Object.keys(filters).length > 0) ?
        Object.keys(filters)
          .map((key) => candidate[key] === filters[key])
          .reduce((a, b) => a && b) : true;

      if ((candidate.name) && (qualified)) {
        holder.innerHTML += remainCandidateTemplate(candidate);
      }
    });
  });
}

const calculate = (section, candidateObject) => {
  const config = parseConfig(section);

  if (!config) {
    return;
  }

  let user = parseFilled(section);
  let candidate = candidateObject[section.id];

  if (config.type === 'level') {
    let ruler = Array.from(
      $$('.button', section)).map((el) => el.getAttribute('data-code'))
    let neutral = ruler[Math.floor(ruler.length / 2)];

    return similarity(ruler, neutral, user, candidate);
  } else if (config.type === 'choice') {
    if (config.upperBound === 1) {
      let ruler = Array.from(
        $$('.button', section)).map((el) => el.getAttribute('data-code'))
      
      return similarity(ruler, null, user, candidate);
    } else {
      return overlap(user, candidate);
    }
  } else if (config.type === 'rank') {
    return distance(user, candidate);
  } else {
    return null;
  }
}

const renderResults = (results, candidates, filters) => {
  let holder = $('#result-render');

  let rank = 0;
  results.forEach((el) => {
    for (let i in candidates) {
      let candidate = candidates[i];

      let qualified = (Object.keys(filters).length > 0) ?
        Object.keys(filters)
          .map((key) => candidate[key] === filters[key])
          .reduce((a, b) => a && b) : true;

      if ((candidate.name === el.name) && (qualified)) {
        rank += 1;
        holder.innerHTML += displayCandidateTemplate(rank, el.score, candidate);
      }
    }
  });
  return;
};

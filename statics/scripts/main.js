const $ = (s, p) => p ? p.querySelector(s) : document.querySelector(s);

const $$ = (s, p) => p ? p.querySelectorAll(s) : document.querySelectorAll(s);

const runLoading = (el) => {
  el.style.display = 'block';
  el.innerHTML = 'Loading';
  let clock = setInterval(() => el.innerHTML += '.', 1000)
  return clock
}

const stopLoading = (clock, el) => {
  clearInterval(clock)
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

const getButton = (target) => {
  return (target.className.indexOf('button') > -1) ?
        target :
        (target.parentNode.className.indexOf('button') > -1) ?
        target.parentNode :
        (target.parentNode.parentNode.className.indexOf('button') > -1) ?
        target.parentNode.parentNode : null;
}

const bindButtonBehavior = (section) => {
  Array.from($$('#test-render .button', section)).forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();

      let button = getButton(ev.target);
      let fieldset = button.parentNode;

      Array.from($$('.button', fieldset)).forEach((b) => {
        if (b === button) {
          b.setAttribute('data-selected', true);
        } else {
          b.removeAttribute('data-selected');
        }
      });
    });
  });
}

const bindButtonLimit = (section) => {
  Array.from($$('#test-render .button', section)).forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();

      let config = getConfig(section);

      let button = getButton(ev.target);
      let fieldset = button.parentNode;
      let buttonSet = $$('.button[data-selected=true]', fieldset);

      if (button.getAttribute('data-selected') === 'true') {
        button.removeAttribute('data-selected');
      } else {
        if ((config) && (config.upperBound)) {
          if (buttonSet.length >= config.upperBound) {
            alert('已超過可選上限！請先取消選擇其他選項才可以再選喔！');
          } else {
            button.setAttribute('data-selected', 'true');
          }
        }
      }
    });
  });
}

const bindRankLimit = (section) => {
  const inputSet = Array.from($$('input[type=number]', section))
  inputSet.forEach((input) => {
    input.setAttribute('step', 1);
    input.setAttribute('min', 1);
    input.setAttribute('max', inputSet.length);

    input.addEventListener('change', (ev) => {
      if ((ev.target.value < 1) || (ev.target.value > inputSet.length)) {
        alert('不能填入 1~5 以外的數字，請更正。');
        ev.target.value = '';
      } else {
        let dulplicate = inputSet.filter((el) => el.value === ev.target.value);
        if (dulplicate.length > 1) {
          alert('本題組已有排名第 ' + ev.target.value + ' 的選項，請更正。');
          ev.target.value = '';
        }
      }
    });
  });
}

const initializeView = () => {
  Array.from($$('fieldset.inline')).forEach((el) => {
    if ($$('.button', el).length == 3) {
      el.className += ' elements-3';
    } else if ($$('.button', el).length == 4) {
      el.className += ' elements-4';
    } else if ($$('.button', el).length == 5) {
      el.className += ' elements-5';
    }
  })

  Array.from($$('#test form section')).forEach((el) => {
    let config = getConfig(el);

    if (config) {
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
    }
  });

  return;
}

const getConfig = (section) => {
  let str = section.getAttribute('data-config');
  if (str) {
    try {
      let name = str.split(':')[0];
      let config = str.split(':')[1];

      if ((config.indexOf('(') > -1) &&
        (config.indexOf(',') > -1) &&
        (config.indexOf(')') > -1)) {
        type = config.match(/(.+)\(/)[1];
        lb = Number(config.match(/\d+/g)[0]);
        ub = Number(config.match(/\d+/g)[1]);
        return {
          name: name,
          type: type,
          lowerBound: lb,
          upperBound: ub
        };
      } else {
        return {
          name: name,
          type: config
        };
      }
    } catch (e) {
      return {
        type: str
      };
    }
  } else {
    return;
  }
}

const validate = (section) => {
  let config = getConfig(section);

  if (config) {
    if (config.type === 'choice') {
      let answers = $$('#' + config.name + ' .button[data-selected=true]');
      if ((answers.length >= config.lowerBound) &&
        (answers.length <= config.upperBound)) {
        return null;
      } else {
        return ('勾選選項數目不符合題目要求，最多選 ' +
          config.upperBound + ' 個，最少選 ' + config.lowerBound + ' 個');
      }
    } else if (config.type === 'level') {
      let answers = $$('#' + config.name + ' .button[data-selected=true]');
      if (answers.length === 1) {
        return null;
      } else {
        return '只能選 1 個';
      }
    } else if (config.type === 'list') {
      return null;
    } else if (config.type === 'rank') {
      let answers = Array.from($$('#' + config.name + ' input'));
      let ret = null;

      answers.forEach((answer) => {
        if (!answer.value) {
          ret = '有未填欄位';
        }

        let dulplicate = answers.filter((el) => answer.value === el.value);
        if (dulplicate.length > 1) {
          ret = '排名重複';
        }
      });
      return ret;
    } else if (config.type === 'allocation') {
      return null;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

const getFilled = (section) => {
  let config = getConfig(section);

  if (config) {
    if (config.type === 'choice') {
      let answerNodes = $$('#' + config.name + ' .button[data-selected=true]');
      let answers = Array.from(answerNodes);
      if (config.upperBound === 1) {
        return answers.map((el) => el.getAttribute('data-code'))[0];
      } else {
        return answers.map((el) => el.getAttribute('data-code'));
      }
    } else if (config.type === 'level') {
      let answer = $('#' + config.name + ' .button[data-selected=true]');
      return answer.getAttribute('data-code');
    } else if (config.type === 'list') {
      return $('#' + config.name + ' select').value;
    } else if (config.type === 'rank') {
      let answerNodes = $$('#' + config.name + ' input');
      let answers = Array.from(answerNodes);
      let holder = answers.map(
        (el) => {
          return {
            rank: Number(el.value),
            code: el.getAttribute('data-code'),
          }
        }
      );

      holder = holder.sort(
        (a, b) => ((a.rank < b.rank) ? -1 : ((a.rank > b.rank) ? 1 : 0)));

      return holder.map((el) => el.code);
    } else if (config.type === 'allocation') {
      return null;
    } else {
      return null;
    }
  } else {
    return null;
  }
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

    if (pass) {
      let filters = {};

      sections.forEach((section) => {
        let config = getConfig(section);

        if (config) {
          if ((config.type === 'list') && (getFilled(section) !== '*')) {
            filters[config.name] = getFilled(section);
          }
        }
      });

      let scores = {}

      candidates.forEach((candidate) => {
        if (candidate['name']) {
          scores[candidate['name']] = 0;
          let base = 0;
          sections.forEach((section) => {
            let id = section.id;
            let score = calculate(section, candidate[id]);
            if (score) {
              base += 1;
              scores[candidate['name']] += score;
            }
          });
          scores[candidate['name']] = scores[candidate['name']] * 100 / base;
        }
      });

      let holder = new Array();
      for (var name in scores) {
        holder.push({
          name: name,
          score: scores[name]
        });
      }
      holder = holder.sort(
        (a, b) => ((a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0)));

      renderResults(holder, candidates, filters);
      $('#result').style.display = 'block';
    }
  });
}

const calculate = (section, candidate) => {
  const config = getConfig(section);

  if (config) {
    let user = getFilled(section);
    if (config.type === 'level') {
      let ruler = Array.from(
          $$('.button', section)).map((el) => el.getAttribute('data-code'))
      let neutral = ruler[Math.floor(ruler.length / 2)];
      return similarity(ruler, neutral, user, candidate);
    } else if (config.type === 'choice') {
      if ((config.upperBound === 1) && (config.lowerBound === 1)) {
        let ruler = Array.from(
            $$('.button', section)).map((el) => el.getAttribute('data-code'));
        return similarity(ruler, null, user, candidate);
      } else {
        return overlap(user, candidate);
      }
    } else if (config.type === 'rank') {
      return distance(user, candidate);
    } else {
      return null;
    }
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

      let qualified = true;
      for (let key in filters) {
        qualified = (candidate[key] === filters[key]);
      }

      if ((candidate.name === el.name) && (qualified)) {
        rank += 1;

        let candidate = candidates[i];
        let identity = (
          ((candidate.region) ? candidate.region : '') + ' ' +
          candidate.number + ' 號'
        );

        holder.innerHTML += (
          '<section>' +
          '<h2><span>第 ' + rank + ' 名：' + candidate.name +
          '，相似度 ' + (Math.round(el.score * 100) / 100) + ' %！</span></h2>' +
          '<p>這位是' + identity + '候選人' +
          '，公報連結<a target="_blank" href="' + candidate.link +
          '">在此</a>。</p>' +
          '<h3>這位候選人認為...</h3>' +
          '<p>' + candidate.description + '</p>' +
          '</section>'
        )
      }
    }
  });
  return;
};

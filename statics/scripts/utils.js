const nl2br = (s) => s.replace(/([^>])\n/g, '$1<br/>\n');

const $ = (s, p) => p ? p.querySelector(s) : document.querySelector(s);

const $$ = (s, p) => p ? p.querySelectorAll(s) : document.querySelectorAll(s);

const parseConfig = (section) => {
  let str = section.getAttribute('data-config');
  if (str) {
    try {
      let name = str.split(':')[0];
      let config = str.split(':')[1];
      let check = ['(', ',', ')']
        .map((el) => config.indexOf(el) > -1)
        .reduce((a, b) => a && b);

      if (check) {
        return {
          name: name,
          type: config.match(/(.+)\(/)[1],
          lowerBound: Number(config.match(/\d+/g)[0]),
          upperBound: Number(config.match(/\d+/g)[1])
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
  let config = parseConfig(section);

  if (!config) {
    return;
  }

  if (config.type === 'choice') {
    let answers = $$('.button[data-selected=true]', section);
    if ((answers.length >= config.lowerBound) &&
      (answers.length <= config.upperBound)) {
      return null;
    } else {
      return ('勾選選項數目不符合題目要求，最多選 ' +
        config.upperBound + ' 個，最少選 ' + config.lowerBound + ' 個');
    }
  } else if (config.type === 'level') {
    let answers = $$('.button[data-selected=true]', section);
    if (answers.length === 1) {
      return null;
    } else {
      return '只能選 1 個';
    }
  } else if (config.type === 'list') {
    return null;
  } else if (config.type === 'rank') {
    let answers = Array.from($$('input', section));
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
  } else {
    return null;
  }
}

const parseFilled = (section) => {
  let config = parseConfig(section);

  if (!config) {
    return;
  }

  if (config.type === 'choice') {
    let answers = Array.from($$('.button[data-selected=true]', section));
    if (config.upperBound === 1) {
      return answers.map((el) => el.getAttribute('data-code'))[0];
    } else {
      return answers.map((el) => el.getAttribute('data-code'));
    }
  } else if (config.type === 'level') {
    let answer = $('.button[data-selected=true]', section);
    return answer.getAttribute('data-code');
  } else if (config.type === 'list') {
    return $('select', section).value;
  } else if (config.type === 'rank') {
    let answers = Array.from($$('input', section));
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
  } else {
    return null;
  }
}

const getButton = (target) => {
  return (target.className.indexOf('button') > -1) ?
    target :
    (target.parentNode.className.indexOf('button') > -1) ?
    target.parentNode :
    (target.parentNode.parentNode.className.indexOf('button') > -1) ?
    target.parentNode.parentNode : null;
}

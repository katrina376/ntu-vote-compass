const sectionExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      text = text
        .replace(/<h([12])(.+?)>/g, '</section><section$2><h$1>')
        .replace(
          /<section(.*?)><h2([\S\s]*?)<p><code>([\S\s]+?):([\S\s]+?)<\/code><\/p>/g,
          '<section id="$3" data-config="$3:$4"><h2$2'
        )

      text = text.replace('</section>', '') + '</section>'

      return text;
    }
  }

  return [ext];
}

const h2Ext = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      text = text
        .replace(/(<h2>)/g, '$1<span>')
        .replace(/(<\/h2>)/g, '</span>$1')

      return text;
    }
  }

  return [ext];
}

const outlineExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      let matches = text.match(/<section.*?data\-config=".+?:outline"[\S\s]*?<\/section>/g)

      for (var i in matches) {
        let sub = matches[i]
          .replace(
            /(<h2>[\S\s]*?<\/h2>)([\S\s]+?)<\/section>/g,
            '$1<section class="outline">$2</section></section>'
          )
        text = text.replace(matches[i], sub)
      }
      return text
    }
  };

  return [ext];
}

const listExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      let matches = text.match(/<section.*?data\-config=".+?:list"[\S\s]*?<\/section>/g)

      for (var i in matches) {
        let id = matches[i].match(/data\-config="(.+?):list"/)[1]
        let sub = matches[i]
          .replace(
            /<ul>([\S\s]*?)<\/ul>/g,
            '<select id="' + id + '">$1</select>'
          )
          .replace(
            /<li><a href="(.*?)">(.*?)<\/li>/g,
            '<option value="$1">$2</option>'
          );
        text = text.replace(matches[i], sub)
      }
      return text
    }
  }

  return [ext];
}

const choiceExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      let matches = text.match(/<section.*?data\-config=".+?:choice[\S\s]*?<\/section>/g)

      for (var i in matches) {
        let name = matches[i].match(/data\-config="(.+?):choice/)[1];
        let sub = matches[i].replace(/<ul>([\S\s]*?)<\/ul>/g, '<div class="warning"></div><fieldset>$1</fieldset>');

        let submatches = sub.match(/<li><a href=".+?">.+?<\/a><\/li>/g);

        for (var j in submatches) {
          let id = name + '_' + j;
          let parse = submatches[j].match(/<li><a href="(.+?)">(.+?)<\/a><\/li>/);
          let display = parse[2];
          let code = parse[1];

          sub = sub.replace(
            submatches[j],
            (
              '<div class="button choice" id="' + id +
              '" data-code="' + code + '">' +
              '<div class="row"><span class="icon"></span></div>' +
              '<div class="row">' + display + '</div>' +
              '</div>'
            )
          )
        }

        text = text.replace(matches[i], sub)
      }
      return text
    }
  }

  return [ext];
}

const levelExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      let matches = text.match(/<section.*?data\-config=".+?:level[\S\s]*?<\/section>/g)

      for (var i in matches) {
        let name = matches[i].match(/data\-config="(.+?):level/)[1];
        let sub = matches[i].replace(/<ul>([\S\s]*?)<\/ul>/g, '<div class="warning"></div><fieldset class="inline">$1</fieldset>');

        let submatches = sub.match(/<li><a href=".+?">.+?<\/a><\/li>/g);

        for (var j in submatches) {
          let id = name + '_' + j;
          let parse = submatches[j].match(/<li><a href="(.+?)">(.+?)<\/a><\/li>/);
          let display = parse[2];
          let code = parse[1];

          sub = sub.replace(
            submatches[j],
            (
              '<div class="button choice" id="' + id +
              '" data-code="' + code + '">' +
              '<div class="row"><span class="icon"></span></div>' +
              '<div class="row">' + display + '</div>' +
              '</div>'
            )
          )
        }

        text = text.replace(matches[i], sub)
      }
      return text
    }
  }

  return [ext];
}

const rankExt = () => {
  let ext = {
    type: 'output',
    filter: (text, converter, options) => {
      let matches = text.match(/<section.*?data\-config=".+?:rank[\S\s]*?<\/section>/g)

      for (var i in matches) {
        let name = matches[i].match(/data\-config="(.+?):rank/)[1];
        let sub = matches[i].replace(/<ul>([\S\s]*?)<\/ul>/g, '<div class="warning"></div><fieldset>$1</fieldset>');

        let submatches = sub.match(/<li><a href=".+?">.+?<\/a><\/li>/g);

        for (var j in submatches) {
          let id = name + '_' + j;
          let parse = submatches[j].match(/<li><a href="(.+?)">(.+?)<\/a><\/li>/);
          let display = parse[2];
          let code = parse[1];

          sub = sub.replace(
            submatches[j],
            (
              '<label for="' + id + '">' +
              '<input type="number"' +
              'name="' + name +
              '" id="' + id +
              '" data-code="' + code + '" required/>' +
              display +
              '</label>'
            )
          )
        }

        text = text.replace(matches[i], sub)
      }
      return text
    }
  }

  return [ext];
}

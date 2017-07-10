var parties = [];

const colours = {
  "National": "#0057b8",
  "Labour": "#e4002b",
  "Green": "#80A73E",
  "NZ First": "#000",
  "Maori": "#8b0000",
  "Act": "#ffff00",
  "United": "#800080"
};

var canvas = d3
    .select("#canvas")
    .append("svg")
    .attr({width: 30, height: 300});

var total = 0;
var filled = 0;

$(document).ready(() => {
  $.ajax({
    url: "https://crossorigin.me/http://www.curia.co.nz/embed/poll",
    type: "GET",
    success: function (data) {
      var tempData = $(data);

      tempData.find("tbody tr").each(function (index) {
          var party = {
            name: $(this).find('th').text(),
            seats: parseInt($(this).find('td:nth-of-type(2)').text())
          };
          party.colour = colours[party.name];

          if (party.name == "United") {
            party.name = "United Future";
          }

          if (party.seats > 0) {
            parties.push(party);
            total += party.seats;
          }
      });

      for (var index in parties) {
        let template = Handlebars.compile($("#party-list-item").html());
        let html = template({ index, name: parties[index].name });
        $("#parties").append(html);

        $("#loader").hide();
      }

      var threshold = (Math.ceil(total / 2) / total) * 300;
      canvas.append('line')
      .attr({
        x1: 0,
        x2: 30,
        y1: threshold,
        y2: threshold
      })
      .style({
        stroke: 'orange',
        'stroke-width': 1,
        'stroke-dasharray': ("2, 1")
      });
    }
  });

});

$("#parties").on("change", "[type=checkbox]", () => {
  var checked = [];
  $('#parties input:checked').each(function(index) {
    checked.push($(this).val());
  });

  doGraph(checked.reverse());
});

function doGraph(indexes) {
  var data = [];
  var yOffset = 0;
  filled = 0;

  for (var i = 0; i < indexes.length; i++) {
    var item = parties[indexes[i]];

    var datum = {
      value: item.seats,
      colour: item.colour,
      x: 2,
      y: yOffset
    };

    yOffset += item.seats;
    filled += item.seats;

    data.push(datum);
  }

  var bars = canvas.selectAll('rect').remove();

  canvas.selectAll('rect').data(data)
    .enter()
    .insert('rect', ':first-child')
    .attr({
        width: 26,
        height: function(d) {
          var asPercent = d.value / total;
          return 300  * asPercent;
        },
        x: 2,
        y: function(d) {
            var asPercent = (d.y + (total - filled)) / total;
            return 300 * asPercent;
        },
        fill: function(d) {
            return d.colour;
        }
    })
    .style({
      fill: function(d) {
          return d3.rgb(d.colour);
        }
    });

  $('#seats').text(filled);
  if (filled >= Math.ceil(total / 2)) {
    $('#seats').addClass('enough');

    let template = Handlebars.compile($("#notes-item").html());
    let html = template(notes(indexes));
    $('#notes').html(html);
  } else {
    $('#seats').removeClass('enough');
    let template = Handlebars.compile($("#notes-item").html());
    let html = template({
      title: "No majority yet",
      body: "Select more parties to form a majority"
    });
    $('#notes').html(html);
  }
}

function notes(indexes) {
  var key = indexes.reverse().join('-');
  console.log(key);

  var response;
  switch(key) {
    case '0-2':
      response = {
        title: "Blue-Green Coalition",
        body: "While coalitions between the National Party and the Greens may be concievable to a few pundits, the Green Party has sternly ruled out such an arrangement."
      };
      break;
    case '0-1':
      response = {
        title: "Grand Coalition",
        body: "While possible in Germany, this would be <b>inconcievable</b> here."
      };
      break;
    case '0-3':
      response = {
        title: "A Tense Coalition",
        body: "Winston Peters, leader of New Zealand First, once formed a coalition with National back in 1996, securing the role of 'Deputy Prime Minister'.<br>This didn't last long: Prime Minister Jenny Shipley sacked him from the job in 1998.<br>With NZ First's attacks on the government so far, this coalition seems unlikely. But, with Winston in charge, it's still very possible."
      };
      break;
    case '0-4-5-6':
      response = {
        title: "The Status Quo",
        body: "The government of the last 9 years. Proven to work together without noticeable tension."
      };
      break;
    case '1-2-3':
      response = {
        title: "The Left Coalition",
        body: "What Labour's hoping for. While the Greens and NZ First would greatly struggle working together, this has shown to be the only hope the left has for forming a new government.<br>If this comes to fruition, which coalition partner will get second place?<br>Either way, Labour's commitment to a three-way coalition certainly admits weakness."
      };
      break;
    case '0-3-6':
    case '0-3-5-6':
    case '1-2-3-6':
      response = {
        title: "Is It Possible?",
        body: "NZ First and United Future's mutual anomisity is well known- could they actually work together?"
      };
      break;
    case '0-3-5':
      response = {
        title: "Is It Possible?",
        body: "NZ First and Act's mutual anomisity is well known- could they actually work together?"
      };
      break;
    case '0-3-4':
    case '1-2-3-4':
      response = {
        title: "Racial Tensions",
        body: "New Zealand First has often been hostile to what it calls the Maori Party's support for 'race-based law', throwing into question such a coalition.<Br>However, the Maori Party has managed to work with National for 9 years, so working with NZ First isn't quite as far-fetched as we thought."
      };
      break;
    case '0-4-5':
      response = {
        title: "Not probable",
        body: "There's no reason National would just drop United Future from a stable government."
      };
      break;
    case '0-5-6':
      response = {
        title: "Not probable",
        body: "There's no reason National would just drop Act from a stable government. Where else could Act go?"
      };
      break;
    case '0-4-6':
      response = {
        title: "Not probable",
        body: "There's no reason National would just drop the Maori Party from a stable government. The Maori Party likes to be at the table, anyway."
      };
      break;
    case '0-1-2-3-4-5-6':
      response = {
        title: "C'mon. Be realistic.",
        body: "Where's the opposition? Who gets what ministerial positions? How dull."
      };
      break;
    default:
     response = {
       title: "Inconcievable",
       body: "A very unlikely coalition..."
     };
     break;
  }
  console.log(response);

  return response;
}

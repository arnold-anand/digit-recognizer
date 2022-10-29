//Reference all html elements
let canvas       = document.getElementById("canvas");
let clear_button = document.getElementById("clear_canvas");
let eval_button  = document.getElementById("guess_digit");
let quote_box    = document.getElementById("quote");
let output_block = document.getElementById("output");
let view_probs   = document.getElementById("display_probs");
let stat_modal   = document.getElementById("stat_modal");
let chart_div    = document.getElementById("chart_div");

//Load canvas library (jSketch) and set default config
let sketcher = new Sketchable(canvas,{graphics: {lineWidth: 10,strokeStyle: '#C2D991', fillStyle: '#C2D991'}});


// Hide view probability button 
view_probs.style.visibility = 'hidden';

//Default chart data
let data = [
    ['Digit', 'Probability'],
    ['0',0],
    ['1',0],
    ['2',0],
    ['3',0],
    ['4',0],
    ['5',0],
    ['6',0],
    ['7',0],
    ['8',0],
    ['9',0]
];

//Expand modal and draw chart on button (view_probs) click
view_probs.onclick = () => 
{
    let drawChart = () =>
    {
        let chart_data =  google.visualization.arrayToDataTable(data);
        let options = 
          {
            title:'Prediction Probabilities for each digit',
            backgroundColor: 'transparent',
            fontSize: 20,
            legendTextStyle: { color: '#FFF' },
            legend:{
                     position:'bottom'
                   },
            titleTextStyle: { color: '#FFF', fontSize:15 },
            is3D: true

          };
        let chart = new google.visualization.PieChart(chart_div);
        chart.draw(chart_data, options);
    };

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    stat_modal.style.display = 'block';
};


//Reset canvas and hide view probability button
clear_button.onclick = () => 
{
    sketcher.clear();
    canvas.width  = 200;
    canvas.height = 200;

    view_probs.style.visibility = 'hidden';
    view_probs.classList.remove("fadeIn");
};


let model_loaded = false;
let model = null;

//Load tensorflow model
async function loadtf()
{   
    model = await tf.loadLayersModel('model/model.json');
    model_loaded = true;

    console.log(' - model loaded');
    console.log(' - Printing model summary : ');
    console.log(model.summary());
}
loadtf();


eval_button.onclick = () =>
{
    if(!model_loaded)
    {
        alert("AI is still loading");
        return;
    }

    image = tf.browser.fromPixels(canvas,1).resizeBilinear([28,28]);

    image = tf.div(image,255);     //Normalize
    image = image.expandDims();    //expandDims to match model input shape
    preds = model.predict(image);  //run prediction

    preds.data().then((scores) =>
    {
        console.log(scores);
        
        guess = scores.indexOf(Math.max(...scores));
        prob  = scores[guess];
        
        quote.innerHTML = ` I am ${(prob*100).toFixed(2)}% certain that the digit you drew somewhat looks like ... `;
        output_block.innerText = `${guess}`;
        
        for(let i = 1; i < 11; i++)
        {
            data[i][1] = Number( scores[i-1].toFixed(2));
        }

        view_probs.style.visibility = 'visible';
        view_probs.classList.add('fadeIn');

    });
    
    
};
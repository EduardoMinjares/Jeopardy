let categories = [];
$("#spin-container").hide()
$("#newGame").hide()

async function getCategoryIds() {
    let categoryIds = []
    for(let i = 0; i < 6; i++){
        let res = await axios.get("http://jservice.io/api/random?count=10")
        //this next loop keeps data that dowsnt have enough questions into the board
        for(let j = 0; j < res.data.length; j++){

            if(res.data[j].category.clues_count >=6) {
                categoryIds.push(res.data[j].category_id)
                break;
                }
        }
    }

    return categoryIds
}

async function getCategory(catId) {
    let res = await axios.get(`http://jservice.io/api/category?id=${catId}`)
    let clueArr = []

    for(let clue of res.data.clues){
        clueArr.push({
            question: clue.question, 
            answer: clue.answer, 
            showing: null
        })
    }
    return {
        title: res.data.title,
        clues: clueArr
    };
}

async function fillTable() {
    // create a thead
    $("thead").empty()
    const tr = document.createElement("tr")
    tr.id = 'thead'
    $('thead').append(tr)

    //fill the table with empty rows to start with
    $("tbody").empty()
    for(let i = 0; i < 5; i++)
    {
        const tr = document.createElement("tr")
        tr.id = `row-${i}`
        $("tbody").append(tr)
    }

    for(let i = 0; i < categories.length; i++) {
        let title = categories[i].title;
        let td = document.createElement("td")
        td.innerText = title
        $("#thead").append(td)

        // loop on clues
        for(let j = 0; j < 5; j++) {
            //handle to a row
            let td1 = document.createElement("td")
            td1.classList.add("question")
            td1.id = `${i}-${j}`
            td1.innerText = `??`
            $(`#row-${j}`).append(td1);
        }
    }
}

function handleClick(evt) {
    //get the ids
    let cat = evt.currentTarget.id.slice(0,1)
    let place = evt.currentTarget.id.slice(2)
    let cell = categories[cat].clues[place]

    if(cell.showing == cell.question){   
        evt.currentTarget.innerText = cell.answer
        cell.showing = cell.answer
    } else
    if(cell.showing == null){
        evt.currentTarget.innerText = cell.question
        cell.showing = cell.question
    } 
    else {

    }
}

function showLoadingView() {
    $("#jeopardy").hide()
    $("#spin-container").show()
}

function hideLoadingView() {
    $("#spin-container").hide()
    $("#jeopardy").show()
}

async function setupAndStart() {
    showLoadingView()

    let cats = await getCategoryIds()
    categories=[]
    for(let i = 0;i < 6;i++){
        categories.push( await getCategory(cats[i]))
    }
    //unbind was used because my handleclick function kept running twice after the second time clicking start
    $(`#jeopardy`).unbind('click').on("click", ".question", function(e){
        handleClick(e)
    });

    fillTable()

    $(`#jeopardy`).css('border', '1px solid #000').css('padding','1px solid #000')
    hideLoadingView()
}

$(`#start`).on("click", function(e){
    setupAndStart()
    $(`#newGame`).show()
    $(`#start`).hide()
});
$(`#newGame`).on("click", setupAndStart);
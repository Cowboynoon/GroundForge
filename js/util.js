function show(form) {
  var data = form.matrix.value
  ? dibl.D3Data().get(
    form.matrix.value,
    form.rows.value * 1,
    form.cols.value * 1,
    form.shiftLeft.value * 1,
    form.shiftUp.value * 1,
    form.stitches.value
  ): dibl.D3Data().get(
    form.set.value,
    form.nrInSet.value * 1,
    form.rows.value * 1,
    form.cols.value * 1,
    form.shiftLeft.value * 1,
    form.shiftUp.value * 1,
    form.stitches.value
  )
  document.getElementById('pairDiagram').innerHTML = ""
  document.getElementById('threadDiagram').innerHTML = ""
  showGraph({
    threadColor: '#colorpicker',
    container: '#pairDiagram',
    width: 250,
    height: 250,
    nodes: data.nodes,
    links: data.links,
    scale: 1,
  })
  showGraph({
    threadColor: '#colorpicker',
    container: '#threadDiagram',
    width: 400,
    height: 400,
    nodes: data.threadNodes,
    links: data.threadLinks,
    scale: 1,
  })
  var link = 'patterns/' + form.set.value + '_' + form.nrInSet.value + '.svg'
  document.getElementById('pattern-link').href = link
  document.getElementById('pattern').src = link
}
function setMax(form) {
  form.nrInSet.max = form.set[form.set.selectedIndex].getAttribute("data-max-nr")
}
function showOptions(id){
  document.getElementById(id).classList.remove('hidden')
  document.getElementById('show'+id).classList.add('hidden')
  document.getElementById('hide'+id).classList.remove('hidden')
}
function hideOptions(id){
  document.getElementById(id).classList.add('hidden')
  document.getElementById('show'+id).classList.remove('hidden')
  document.getElementById('hide'+id).classList.add('hidden')
}
function clear(id){
  document.getElementById(id).value='';
}
function init() {
  var location = (window.location.href + "").replace("#","")
  if (location.indexOf("?") >= 0) {
    location.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        var fields = document.getElementsByName(key)
        if (fields.length > 0) {
            fields[0].value = decodeURIComponent(value).replace(/[+]/g," ")
        }
    })
  }
  show(document.getElementById('graph'))
}

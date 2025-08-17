// Minimal JS to wire role buttons
(function(){function $(id){return document.getElementById(id)}
const sec= {
 emp: $('employeeForm'), leader:$('leaderForm'), neu:$('newForm'), select:$('roleSelectWrap')};
function hideAll(){Object.values(sec).forEach(el=>el.classList.add('hidden'))}
$('roleEmployee').onclick=()=>{hideAll();sec.emp.classList.remove('hidden')};
$('roleLeader').onclick=()=>{hideAll();sec.leader.classList.remove('hidden')};
$('roleNew').onclick=()=>{hideAll();sec.neu.classList.remove('hidden')};
['back1','back2','back3'].forEach(id=>$(id).onclick=()=>{hideAll();sec.select.classList.remove('hidden')});
})();
function openCard(id)
{
    var card = document.getElementById(id);
    card.classList.add("card-opened");
    card.classList.remove("card-closed");
}
function closeCard(id)
{
    var card = document.getElementById(id);
    card.classList.remove("card-opened");
    card.classList.add("card-closed");
}
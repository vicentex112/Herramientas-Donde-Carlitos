const products = [
    { name: "Choclo americano flaco", price: "$400 c/u" },
    { name: "Choclo humero", price: "$500 c/u" },
    { name: "Papa limpia", price: "$500 kilo" },
    { name: "Papa sucia", price: "$500 kilo" },
    { name: "Platano", price: "$1400 kilo" },
    { name: "Uva", price: "$2500 kilo" },
    { name: "Ajos", price: "$250 c/u" },
    { name: "Ajo Chileno", price: "$500 c/u" },
    { name: "Tomate cherry", price: "$2000 x caja ½ kilo" },
    { name: "Limon", price: "$1300 kilo" },
    { name: "Poroto verde", price: "$2800 kilo" },
    { name: "Poroto granado", price: "$1800 kilo" },
    { name: "Aji verde", price: "$350 c/u, 3 x $1000" },
    { name: "Zanahoria", price: "$1000 kilo" },
    { name: "Cebolla cafe", price: "$1000 kilo" },
    { name: "Cebolla morada", price: "$1500 kilo" },
    { name: "Cebollin pelado", price: "$700 U y Kg" },
    { name: "Papa camote", price: "$3200 kilo" },
    { name: "Pepino ensalada", price: "$500 c/u" },
    { name: "Zapallo italiano", price: "$350 c/u, 3 x $1000" },
    { name: "Tomate chico", price: "$1200 kilo" },
    { name: "Tomate pomarola chico", price: "$1000 kilo" },
    { name: "Tomate pomarola grande", price: "$1200 kilo" },
    { name: "Tomate grande comun", price: "$1400 kilo" },
    { name: "Albahaca", price: "$1000 c/u" },
    { name: "Sandias", price: "$3800 c/u" },
    { name: "Melon tuna", price: "$2500 c/u" },
    { name: "Melon calameño", price: "$2500 c/u" },
    { name: "Naranjas", price: "$1500 kilo" },
    { name: "Mandarinas", price: "$1000 kilo" },
    { name: "Durazno", price: "$2000 kilo" },
    { name: "Brocoli", price: "$1300 c/u" },
    { name: "Coliflor", price: "$1300 c/u" },
    { name: "Repollo Verde", price: "$1500 c/u" },
    { name: "Repollo Morado", price: "$1500 c/u" },
    { name: "Cebollines", price: "$700 c/u" },
    { name: "Beterragas paquete", price: "$1000 c/u" },
    { name: "Palta grande", price: "$4800 kilo" },
    { name: "Palta segunda", price: "$3800 kilo" },
    { name: "Poroto verde picado bolsa", price: "$1000 c/u" },
    { name: "Miel", price: "$6000 c/u" },
    { name: "Papaya en frasco", price: "$5000 c/u" },
    { name: "Duraznos en frasco", price: "$5000 c/u" },
    { name: "Poroto granado blanco en bolsa", price: "$1500 c/u" },
    { name: "Aceituna bolsa de 1/4", price: "$2000 c/u" },
    { name: "Cebolla escabeche bolsa", price: "$1000 c/u" },
    { name: "Acelgas", price: "$400 c/u" },
    { name: "Cilantro (SI TIENE RAIZ)", price: "$800 c/u" },
    { name: "Perejil (NO TIENE RAIZ)", price: "$500 c/u" },
    { name: "Espinaca", price: "$1000 c/u" },
    { name: "Ciboulette", price: "$600 c/u" },
    { name: "HUEVOS bandeja", price: "$6500 c/u" },
    { name: "HUEVOS por 6", price: "$1800 c/u" },
    { name: "HUEVOS por 12", price: "$3600 c/u" },
    { name: "Lechuga", price: "$1000 c/u" },
    { name: "Zapallo", price: "$1300 kilo" },
    { name: "Frutilla", price: "$3000 kilo" },
    { name: "Limon Sutil", price: "$4000 kilo" },
    { name: "Pimenton Rojo", price: "$1000 c/u" },
    { name: "Pimenton Verde", price: "$600 c/u" },
    { name: "Pera Agua Verde", price: "$1800 kg" },
    { name: "Manzana fuji", price: "$1800 kg" },
    { name: "Pimenton Amarillo", price: "$1000 c/u" },
    { name: "Uvas Verdes", price: "$2500 kg" },
    { name: "Ciruelas", price: "$1800 kg" },
    { name: "Tunas", price: "$2000 kg" },
    { name: "Champiñones bandeja", price: "$1500 c/u" }
];

const priceTable = document.getElementById("priceTable").getElementsByTagName("tbody")[0];
const searchInput = document.getElementById("searchInput");

function displayProducts(productsToDisplay) {
    priceTable.innerHTML = "";
    productsToDisplay.forEach(product => {
        let row = priceTable.insertRow();
        let nameCell = row.insertCell();
        let priceCell = row.insertCell();
        nameCell.textContent = product.name;
        priceCell.textContent = product.price;
    });
}

function filterProducts() {
    const searchTerm = removeAccents(searchInput.value.toLowerCase());
    const filteredProducts = products.filter(product => removeAccents(product.name.toLowerCase()).includes(searchTerm));
    displayProducts(filteredProducts);
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

searchInput.addEventListener("input", filterProducts);

displayProducts(products);

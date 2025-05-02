class Pet {
  constructor(imageUrl, name, temperament, breed_group) {
    this.imageUrl = imageUrl;
    this.name = name;
    this.temperament = temperament;
    this.breed_group = breed_group;
  }

  print() { }
}

class Dog extends Pet {
  constructor(imageUrl, name, temperament, breed_group) {
    super(imageUrl, name, temperament, breed_group);
  }

  print() {
    return `
    <div class="col-md-4 mb-4">
      <div class="card">
        <img src="${this.imageUrl}" class="card-img-top" alt="${this.name}">
        <div class="card-body">
          <h5 class="card-title">${this.name}</h5>
          <p class="card-text">Temperamento: ${this.temperament || 'Sin descripción disponible.'}</p>
          <p class ="card-text">Tipo de raza: ${this.breed_group || 'Sin tipo disponible.'}</p>
          <button class="btn btn-primary w-100" onclick="adoptarMascota('${this.name}', '${this.imageUrl}')">Adoptar <i class="bi bi-bag-plus"></i></button>
        </div>
      </div>
    </div>
  `;
  }
}

class Cat extends Pet {
  constructor(imageUrl, name, temperament, breed_group, child_friendly) {
    super(imageUrl, name, temperament, breed_group);
    this.child_friendly = child_friendly;
  }

  print() {
    return `
    <div class="col-md-4 mb-4">
      <div class="card">
        <img src="${this.imageUrl}" class="card-img-top" alt="${this.name}">
        <div class="card-body">
          <h5 class="card-title">${this.name}</h5>
          <p class="card-text">Temperamento: ${this.temperament || 'Sin descripción disponible.'}</p>
          <p class ="card-text">Tipo de raza: ${this.breed_group || 'Sin tipo disponible.'}</p>
          <p class ="card-text">Nivel de amigable con niños: ${this.child_friendly || 'Sin tipo disponible.'}</p>
          <button class="btn btn-primary w-100" onclick="adoptarMascota('${this.name}', '${this.imageUrl}')">Adoptar <i class="bi bi-bag-plus"></i></button>
        </div>
      </div>
    </div>
  `;
  }
}

let especie = 'dog';
let breeds = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let historalAdopcion = JSON.parse(localStorage.getItem('historalAdopcion')) || [];

const breedSelect = document.getElementById('breed-select');
const breedList = document.getElementById('breed-list');
const sidebar = document.getElementById('sidebar');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const confirmAdoptBtn = document.getElementById('confirm-adopt');
let mascotaSeleccionada = null;

document.getElementById('dog-btn').onclick = () => cargarEspecie('dog');
document.getElementById('cat-btn').onclick = () => cargarEspecie('cat');
document.getElementById('open-cart').onclick = () => sidebar.classList.add('active');
document.getElementById('close-cart').onclick = () => sidebar.classList.remove('active');
document.getElementById('clear-cart').onclick = () => {
  carrito = [];
  actualizarCarrito();
};

document.getElementById('adopt-cart').onclick = () => {
  carrito.map(mascota => mascota.estrellas = 0);
  historalAdopcion.push(...carrito);
  localStorage.setItem('historalAdopcion', JSON.stringify(historalAdopcion));
  carrito = [];
  actualizarCarrito();
  cargarHistorialAdopciones();
};

confirmAdoptBtn.onclick = () => {
  agregarAlCarrito(mascotaSeleccionada);
  const modal = bootstrap.Modal.getInstance(document.getElementById('adopt-modal'));
  modal.hide();
};

function cargarEspecie(tipo) {
  especie = tipo;
  const url = tipo === 'dog' ? 'https://api.thedogapi.com/v1/breeds' : 'https://api.thecatapi.com/v1/breeds';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      breeds = data;
      llenarSelect();
      mostrarBreedCards();
    });
}

function llenarSelect() {
  breedSelect.innerHTML = '<option disabled selected>Seleccione una raza...</option>';
  breeds.forEach(breed => {
    breedSelect.innerHTML += `<option value="${breed.id}">${breed.name}</option>`;
  });
  breedSelect.onchange = mostrarBreedCards;
}

async function mostrarBreedCards() {
  const selectedId = breedSelect.value;
  const lista = selectedId ? breeds.filter(b => b.id == selectedId) : breeds;

  breedList.innerHTML = '';

  for (const breed of lista) {
    let imageUrl = breed.image?.url;

    if (!imageUrl) {
      const apiUrl = especie === 'dog'
        ? `https://api.thedogapi.com/v1/images/search?breed_id=${breed.id}`
        : `https://api.thecatapi.com/v1/images/search?breed_id=${breed.id}`;

      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        imageUrl = data[0]?.url || 'https://via.placeholder.com/300x250?text=Sin+Imagen';
      } catch {
        imageUrl = 'https://via.placeholder.com/300x250?text=Error+Imagen';
      }
    }

    const pet = especie === 'dog'
      ? new Dog(imageUrl, breed.name, breed.temperament, breed.breed_group)
      : new Cat(imageUrl, breed.name, breed.temperament, breed.breed_group, breed.child_friendly);

    breedList.innerHTML += pet.print();
  }
}

function adoptarMascota(nombre, imagen) {
  mascotaSeleccionada = { nombre, imagen, estrellas: 0 };
  document.getElementById('adopt-pet-name').textContent = nombre;
  const modal = new bootstrap.Modal(document.getElementById('adopt-modal'));
  modal.show();
  cargarHistorialAdopciones();
}

function agregarAlCarrito(mascota) {
  carrito.push(mascota);
  actualizarCarrito();
}

function actualizarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cartItems.innerHTML = '';

  if (carrito.length === 0) {
    cartItems.innerHTML = '<li class="list-group-item text-center">Tu carrito está vacío 🐾</li>';
  } else {
    carrito.forEach(item => {
      cartItems.innerHTML += `
        <li class="list-group-item d-flex align-items-center">
          <img src="${item.imagen}" alt="${item.nombre}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">
          <div>${item.nombre}</div>
          <button class="btn btn-danger btn-sm ms-auto" onclick="eliminarDelCarrito('${item.nombre}')">Eliminar <i class="bi bi-trash"></i></button>
        </li>
      `;
    });
  }
  cartCount.textContent = carrito.length;
}

function eliminarDelCarrito(nombre) {
  carrito = carrito.filter(item => item.nombre !== nombre);
  actualizarCarrito();
}

function cargarHistorialAdopciones() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';

  if (historalAdopcion.length === 0) {
    historyList.innerHTML = '<li class="list-group-item text-center">No hay adopciones registradas 🐾</li>';
  } else {
    historalAdopcion.forEach(item => {
      let estrellasTexto = '';
      for (let i = 1; i <= item.estrellas; i++) {
        estrellasTexto += '⭐';
      }

      historyList.innerHTML += `
        <li class="list-group-item d-flex align-items-center">
          <img src="${item.imagen}" alt="${item.nombre}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">
          <div class="me-auto">${item.nombre}</div>
          <div class="me-2">${estrellasTexto}</div>
          <button class="btn btn-primary" onClick="cambiarMascotaSelect('${item.nombre}')">Seleccionar</button>
        </li>
      `;
    });
  }
}

function guardarEstrellas(numEstrellas, nomMascota) {
  let historial = JSON.parse(localStorage.getItem('historalAdopcion')) || [];
  const mascotaIndex = historial.findIndex(mascota => mascota.nombre === nomMascota);

  if (mascotaIndex !== -1) {
    historial[mascotaIndex].estrellas = numEstrellas;
    localStorage.setItem('historalAdopcion', JSON.stringify(historial));
  } else {
    console.warn(`Mascota "${nomMascota}" no encontrada en el historial.`);
  }
}

let mascotaSeleccionadaResena = "";

document.getElementById('btnResena').onclick = () => filtroPuntuacion();

function cambiarMascotaSelect(mascota) {
  alert("Mascota seleccionada")
  mascotaSeleccionadaResena = mascota;
  console.log(`Mascota seleccionada para reseña: ${mascotaSeleccionadaResena}`);
}

function filtroPuntuacion() {
  let filtro = document.getElementById("puntuacion").value;
  guardarEstrellas(filtro, mascotaSeleccionadaResena);
  historalAdopcion = JSON.parse(localStorage.getItem('historalAdopcion')) || [];
  cargarHistorialAdopciones();
}

cargarEspecie('dog');
actualizarCarrito();
cargarHistorialAdopciones();

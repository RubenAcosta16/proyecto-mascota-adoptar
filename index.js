let dogsData = [];

      function promedioDatos(datoArr) {
        const datoSeparado = datoArr.split(" ");
        console.log(datoSeparado);
        const d1 = datoSeparado[0] ? Number(datoSeparado[0]) : 0;
        const d2 = datoSeparado[2] ? Number(datoSeparado[2]) : 0;

        // console.log(d1,d2);

        return (d1 + d2) / 2;
      }

      fetch("https://api.thedogapi.com/v1/breeds")
        .then((response) => response.json())
        .then((data) => {
          dogsData = data;
          populateFilters(data);
          displayDogs(data);
        })
        .catch((error) => {
          console.error("Error al cargar la lista de perros:", error);
        });

      function populateFilters(data) {
        const temperamentSet = new Set();
        const breedGroupSet = new Set();

        data.forEach((dog) => {
          if (dog.temperament) {
            dog.temperament
              .split(", ")
              .forEach((temp) => temperamentSet.add(temp));
          }
          if (dog.breed_group) {
            breedGroupSet.add(dog.breed_group);
          }
        });

        const temperamentFilter = document.getElementById("temperament-filter");
        temperamentSet.forEach((temp) => {
          const option = document.createElement("option");
          option.value = temp;
          option.textContent = temp;
          temperamentFilter.appendChild(option);
        });

        const breedGroupFilter = document.getElementById("breed-group-filter");
        breedGroupSet.forEach((group) => {
          const option = document.createElement("option");
          option.value = group;
          option.textContent = group;
          breedGroupFilter.appendChild(option);
        });
      }

      function displayDogs(data) {
        const dogList = document.getElementById("dog-list");
        dogList.innerHTML = ""; // Limpiar la lista antes de mostrar

        data.forEach((dog) => {
          const col = document.createElement("div");
          col.className = "col-md-4 mb-4";

          const card = document.createElement("div");
          card.className = "card";

          const img = document.createElement("img");
          img.src = `https://cdn2.thedogapi.com/images/${dog.reference_image_id}.jpg`;
          img.className = "card-img-top";
          img.alt = dog.name;

          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          const title = document.createElement("h5");
          title.className = "card-title";
          title.textContent = dog.name;

          const description = document.createElement("p");
          description.className = "card-text";
          description.textContent = dog.breed_group
            ? `Grupo: ${dog.breed_group}`
            : "Grupo: No disponible";

          const temperament = document.createElement("p");
          temperament.className = "card-text";
          temperament.textContent = dog.temperament
            ? `Temperamento: ${dog.temperament}`
            : "Temperamento: No disponible";

          const life_span = document.createElement("p");
          life_span.className = "card-text";
          life_span.textContent = dog.life_span
            ? `Vida promedio: ${promedioDatos(dog.life_span)} años`
            : "Vida promedio: No disponible";

          const weight = document.createElement("p");
          weight.className = "card-text";
          weight.textContent = dog.weight.metric
            ? `Peso: ${promedioDatos(dog.weight.metric)} kg`
            : "Peso: No disponible";

          const height = document.createElement("p");
          height.className = "card-text";
          height.textContent = dog.height.metric
            ? `Altura: ${promedioDatos(dog.height.metric)} cm`
            : "Altura: No disponible";

          const bred_for = document.createElement("p");
          bred_for.className = "card-text";
          bred_for.textContent = dog.bred_for
            ? `Descripción: ${dog.bred_for}`
            : "Descripción: No disponible";

          const botonAdoptar = document.createElement("button");
          botonAdoptar.className = "btn btn-primary";
          botonAdoptar.textContent = "Adoptar";
          botonAdoptar.addEventListener("click", () => {
            alert(`¡Gracias por adoptar a ${dog.name}!`);
          });

          cardBody.appendChild(title);
          cardBody.appendChild(description);
          cardBody.appendChild(temperament);
          cardBody.appendChild(bred_for);
          cardBody.appendChild(life_span);
          cardBody.appendChild(weight);
          cardBody.appendChild(height);
          cardBody.appendChild(botonAdoptar);
          card.appendChild(img);
          card.appendChild(cardBody);
          col.appendChild(card);
          dogList.appendChild(col);
        });
      }

      function filterDogs() {
        const selectedTemp =
          document.getElementById("temperament-filter").value;
        const selectedGroup =
          document.getElementById("breed-group-filter").value;

        const filteredDogs = dogsData.filter((dog) => {
          const matchesTemp = selectedTemp
            ? dog.temperament && dog.temperament.includes(selectedTemp)
            : true;
          const matchesGroup = selectedGroup
            ? dog.breed_group === selectedGroup
            : true;
          return matchesTemp && matchesGroup;
        });

        displayDogs(filteredDogs);
      }

      document
        .getElementById("temperament-filter")
        .addEventListener("change", filterDogs);
      document
        .getElementById("breed-group-filter")
        .addEventListener("change", filterDogs);
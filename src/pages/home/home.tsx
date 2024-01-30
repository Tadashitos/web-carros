import React, { useState, useEffect } from "react";
import { Container } from "../../components/Container/Container";
import { Link } from "react-router-dom";

import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'
import { db } from "../../services/firebaseConnection";

interface CarsProps {
  id: string
  name: string
  year: string
  uid: string
  price: string | number
  city: string
  km: string
  images: CarImageProps[]
}

interface CarImageProps {
  name: string
  uid: string
  url: string
}

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    loadCars()
  }, [])

  function loadCars() {
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

    getDocs(queryRef)
    .then(snapshot => {
      let listCars = [] as CarsProps[]

      snapshot.forEach(doc => {
        listCars.push({
          id: doc.id,
          name: doc.data().name,
          year: doc.data().year,
          km: doc.data().km,
          city: doc.data().city,
          price: doc.data().price,
          images: doc.data().images,
          uid: doc.data().uid
        })
      })

      setCars(listCars)
    })
  }

  function handleImageLoad(id: string) {
    // Layout shift é uma mudança de layout inesperada que acontece na página. Neste caso, ele está acontecendo no momento em que a imagem é carregada, pois quando o useEffect é ativado, fazendo com que as informações do carro (inclusive da imagem) sejam trazidas do banco, em um curto instante, a imagem do carro não é carregada, sendo carregado primeiro as informações do carro e só depois a imagem é carregada. Pra evitar este comportamento, podemos deixar um placeholder no container aonde a imagem fica para que o layout do componente não sofra alterações brutas instantâneas
    setLoadImages(prevImageLoaded => [...prevImageLoaded, id])
  }

  async function handleSearchCar() {
    if(input === '') {
      loadCars()
      return
    }

    setCars([])
    setLoadImages([])

    // OBS: para que a pesquisa ocorra de forma correta, é necessário escrever o nome do carro no campo de pesquisa  EXATAMENTE igual ao nome do carro cadastrado. Uma forma de contornar isso é, antes de enviar os dados do carro para o Firebase, converter o nome do carro para uppercase. Isso foi feito na página "new.tsx". E aqui no campo de busca, também fazer a mesma coisa, para que as comparações não sejam afetadas por case sensitive
    const q = query(collection(db, "cars"), where("name", ">=", input.toUpperCase()), where("name", "<=", input.toUpperCase() + "\uf8ff"))

    const querySnapshot = await getDocs(q)

    let listCars = [] as CarsProps[]
    
    querySnapshot.forEach(doc => {
      listCars.push({
        id: doc.id,
        name: doc.data().name,
        year: doc.data().year,
        km: doc.data().km,
        city: doc.data().city,
        price: doc.data().price,
        images: doc.data().images,
        uid: doc.data().uid
      })
    })

    setCars(listCars)
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input placeholder="Digite o nome do carro" type="text" className="w-full border-2 rounded-lg h-9 px-3 outline-none" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg" onClick={handleSearchCar}>Buscar</button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map(car => {
          return (
            <Link key={car.id} to={`/car/${car.id}`}>
              <section className="w-full bg-white rounded-lg">
                <div className="w-full h-72 rounded-lg bg-slate-200 flex items-center justify-center" style={{ display: loadImages.includes(car.id) ? "none" : "flex" }}></div>
                <img src={car.images[0].url} alt="Carro" className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all" onLoad={() => handleImageLoad(car.id)} style={{ display: loadImages.includes(car.id) ? "block" : "none" }} />
                <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
                <div className="flex flex-col px-2">
                  <span className="text-zinc-700 mb-6">{car.year} | {car.km} km</span>
                  <strong className="text-black font-medium text-xl">R$ {car.price},00</strong>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

                <div className="px-2 pb-2">
                  <span className="text-zinc-700">
                    {car.city}
                  </span>
                </div>
              </section>
            </Link>
          )
        })}
      </main>
    </Container>
  );
}
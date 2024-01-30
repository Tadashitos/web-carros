/* eslint-disable array-callback-return */
import React, { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/Container/Container";
import { DashboardHeader } from "../../../components/PanelHeader/PanelHeader";

import { FiUpload, FiTrash } from "react-icons/fi"
import { useForm } from "react-hook-form"
import { Input } from "../../../components/Input/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../contexts/AuthContext";

import { v4 as uuidV4 } from "uuid"

import { storage, db } from "../../../services/firebaseConnection";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

import { addDoc, collection } from 'firebase/firestore'

import { toast } from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "O nome do carro é obrigatório!"),
  model: z.string().min(1, "O modelo do carro é obrigatório!"),
  year: z.string().min(1, "O ano do carro é obrigatório!"),
  km: z.string().min(1, "O KM do carro é obrigatório!"),
  price: z.string().min(1, "O preço do carro é obrigatório!"),
  city: z.string().min(1, "A o campo da cidade é obrigatória!"),
  whatsapp: z.string().min(1, "O telefone é obrigatório!").refine(value => /^(\d{11,12})$/.test(value), {
    message: "Número de telefone inválido!"
  }),
  description: z.string().min(1, "A descrição do carro é obrigatória!")
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

export function New() {
  const { user } = useContext(AuthContext)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const [carImages, setCarImages] = useState<ImageItemProps[]>([])

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files && e.target.files[0]) {
      const image = e.target.files[0]
      if(image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image)
      } else {
        alert("Envie uma imagem JPG ou PNG!")
        return
      }
    }
  }

  async function handleUpload(image: File) {
    if(!user?.uid) {
      return
    }

    const currentUid = user?.uid
    const uidImage = uuidV4()
    
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
      .then(snapshot => {
        getDownloadURL(snapshot.ref)
          .then(downloadURL => {
            const imageItem = {
              name: uidImage,
              uid: currentUid,
              previewUrl: URL.createObjectURL(image),
              url: downloadURL
            }

            setCarImages(images => [...images, imageItem])
            toast.success("Imagem cadastrada com sucesso")
          })
      })
  }

  async function onSubmit(data: FormData) {
    if(carImages.length === 0) {
      toast.error("Envie alguma imagem desse carro!")
      return
    }

    const carListImages = carImages.map(carro => {
      return {
        uid: carro.uid,
        name: carro.name,
        url: carro.url
      }
    })

    addDoc(collection(db, 'cars'), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    })
    .then(_ => {
      reset()
      setCarImages([])
      toast.success("Carro cadastrado com sucesso")
    })
    .catch(_ => toast.error("Erro ao cadastrar o carro no banco"))
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`
    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter(carro => carro.url !== item.url))
    } catch(_) {
      console.log("Erro ao deletar")
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
          </div>
        </button>

        {carImages.map(item => {
          return (
            <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
              <button className="absolute" onClick={() => handleDeleteImage(item)}>
                <FiTrash size={28} color="#fff" />
              </button>
              <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" alt="Foto do Carro" />
            </div>
          )
        })}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input type="text" register={register} name="name" error={errors.name?.message} placeholder="Ex: Civic" />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input type="text" register={register} name="model" error={errors.model?.message} placeholder="Ex: 1.0 Flex Plus Manual" />
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro</p>
              <Input type="text" register={register} name="year" error={errors.year?.message} placeholder="Ex: 2016/2016" />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">KMs rodados</p>
              <Input type="text" register={register} name="km" error={errors.km?.message} placeholder="Ex: 23.900" />
            </div>
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone/WhatsApp</p>
              <Input type="text" register={register} name="whatsapp" error={errors.whatsapp?.message} placeholder="Ex: 11999998888" />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input type="text" register={register} name="city" error={errors.city?.message} placeholder="Ex: São Paulo" />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço do carro</p>
            <Input type="text" register={register} name="price" error={errors.price?.message} placeholder="Ex: 60.000" />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea className="border-2 w-full rounded-md h-24 px-2" {...register("description")} name="description" id="description" placeholder="Digite a descrição completa sobre o carro" />
            {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
          </div>

          <button type="submit" className="rounded-md w-full h-10 bg-zinc-900 text-white font-medium">
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
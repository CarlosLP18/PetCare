import { useState } from "react"
import {
  Container,
  Heading,
  Stack,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Field,
  NativeSelect
} from "@chakra-ui/react"
import { Link as RouterLink } from 'react-router-dom'
import { createCampaign } from "../api/campaigns"

const CreateCampaign = () => {
  const initialForm = {
    title: "",
    pet_name: "",
    pet_species: "",
    pet_breed: "",
    pet_age_years: "",
    diagnosis: "",
    vet_name: "",
    vet_clinic: "",
    story: "",
    goal_amount: "",
    deadline: "",
    images: "",
    medical_documents: "",
  }
  
  const [formData, setFormData] = useState(initialForm)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        title: formData.title.trim(),
        pet_name: formData.pet_name.trim(),
        pet_species: formData.pet_species,
        pet_breed: formData.pet_breed.trim() || null,
        pet_age_years:
          formData.pet_age_years === "" ? null : Number(formData.pet_age_years),
        diagnosis: formData.diagnosis.trim(),
        vet_name: formData.vet_name.trim() || null,
        vet_clinic: formData.vet_clinic.trim() || null,
        story: formData.story.trim(),
        goal_amount: Number(formData.goal_amount),
        deadline: formData.deadline,
        images: formData.images.trim() ? [formData.images.trim()] : [],
        medical_documents: formData.medical_documents.trim()
          ? [formData.medical_documents.trim()]
          : [],
      }

      const response = await createCampaign(payload)

      console.log("Created:", response)
      setFormData(initialForm)
      alert("Campaign created successfully")
    } catch (error) {
      console.error(error)
      alert("Error creating campaign")
    }
  }

  return (
    <Container maxW="3xl" py={10}>
      <Button as={RouterLink} to="/" variant="ghost" mb={4}>← Back</Button>
      
      <Heading mb={8} color="teal.600">New Aid Campaign</Heading>
      
      <form onSubmit={handleSubmit} lang="en">
        <Stack gap={6}>
          <Field.Root required>
            <Field.Label>Campaign Title</Field.Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Field.Root>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root required>
              <Field.Label>Pet's Name</Field.Label>
              <Input
                name="pet_name"
                placeholder="E.g: Luna"
                value={formData.pet_name}
                onChange={handleChange}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Species</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  name="pet_species"
                  value={formData.pet_species}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a species
                  </option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="bunny">Bunny</option>
                  <option value="reptile">Reptile</option>
                  <option value="other">Other</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root>
              <Field.Label>Breed</Field.Label>
              <Input
                name="pet_breed"
                value={formData.pet_breed}
                onChange={handleChange}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Age</Field.Label>
              <Input
                name="pet_age_years"
                type="number"
                min="0"
                step="0.1"
                value={formData.pet_age_years}
                onChange={handleChange}
              />
            </Field.Root>
          </SimpleGrid>

          {/* INFO MÉDICA */}
          <Field.Root required>
            <Field.Label>Medical Diagnosis</Field.Label>
            <Input
              name="diagnosis"
              placeholder="What do you need to treat?"
              value={formData.diagnosis}
              onChange={handleChange}
              minLength={50}
            />
          </Field.Root>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root>
              <Field.Label>Veterinarian in Charge</Field.Label>
              <Input
                name="vet_name"
                value={formData.vet_name}
                onChange={handleChange}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Veterinary Clinic</Field.Label>
              <Input
                name="vet_clinic"
                value={formData.vet_clinic}
                onChange={handleChange}
              />
            </Field.Root>
          </SimpleGrid>

          <Field.Root required>
            <Field.Label>Pet's History</Field.Label>
            <Textarea
              name="story"
              h="150px"
              placeholder="Tell us why you need help..."
              minLength={100}
              value={formData.story}
              onChange={handleChange}
            />
          </Field.Root>

          {/* DINERO Y FECHAS */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root required>
              <Field.Label>Goal to Achieve ($)</Field.Label>
              <Input
                name="goal_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.goal_amount}
                onChange={handleChange}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Deadline</Field.Label>
              <Input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </Field.Root>
          </SimpleGrid>

          {/* ARCHIVOS */}
          <Field.Root>
            <Field.Label>Images</Field.Label>
            <Input
              name="images"
              placeholder="Image URL"
              mb={2}
              value={formData.images}
              onChange={handleChange}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Medical Documents</Field.Label>
            <Input
              name="medical_documents"
              placeholder="Medical document URL"
              value={formData.medical_documents}
              onChange={handleChange}
            />
          </Field.Root>

          <Button type="submit" colorPalette="teal" size="lg" mt={4} h="60px" fontSize="xl">
            Publish Campaign 🐾
          </Button>
        </Stack>
      </form>
    </Container>
  )
}

export default CreateCampaign
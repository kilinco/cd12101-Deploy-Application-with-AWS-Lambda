import { useAuth0 } from '@auth0/auth0-react'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Form, Progress } from 'semantic-ui-react'
import { getUploadUrl, uploadFile } from '../api/todos-api'

export function EditTodo() {
  const [file, setFile] = useState(undefined)
  const [uploadState, setUploadState] = useState(0)
  const { getAccessTokenSilently } = useAuth0()
  const { todoId } = useParams()

  function handleFileChange(event) {
    const files = event.target.files
    if (!files) return

    setFile(files[0])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      if (!file) {
        alert('File should be selected')
        return
      }

      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-ol326uhiocrmop0u.us.auth0.com/api/v2/`,
        scope: 'write:todos'
      })
      setUploadState(10)
      const uploadUrl = await getUploadUrl(accessToken, todoId)

      setUploadState(50)
      await uploadFile(uploadUrl, file)
      setUploadState(100)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
      setUploadState(0)
    }
  }

  return (
    <div>
      <h1>Upload new image</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>File</label>
          <input
            type="file"
            accept="image/*"
            placeholder="Image to upload"
            onChange={handleFileChange}
          />
        </Form.Field>

        {uploadState > 0 && (
          <Progress percent={uploadState} indicating progress success />
        )}

        <Button loading={uploadState > 0 && uploadState < 100} type="submit">
          Upload
        </Button>
      </Form>
    </div>
  )
}

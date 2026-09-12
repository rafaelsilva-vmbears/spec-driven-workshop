import { expect, test } from '@playwright/test'

const API_KEY = process.env.API_KEY || 'my-dev-api-key-123'
const authHeaders = {
  'x-api-key': API_KEY,
}

test.describe('Task Management API — Journey Black-Box Tests', () => {
  test('should complete the full lifecycle of a task', async ({ request }) => {
    // 1. POST /tasks -> 201 Created (cria tarefa com dados válidos)
    const createRes = await request.post('/api/tasks', {
      headers: authHeaders,
      data: {
        title: 'Tarefa de Jornada Playwright',
        description: 'Criada no teste de aceitação E2E',
        status: 'PENDING',
      },
    })
    expect(createRes.status()).toBe(201)
    const createdTask = await createRes.json()
    expect(createdTask.id).toBeDefined()
    expect(createdTask.title).toBe('Tarefa de Jornada Playwright')
    expect(createdTask.status).toBe('PENDING')
    const taskId = createdTask.id

    // 2. GET /tasks/{id} -> 200 OK (valida se os dados foram persistidos)
    const getRes = await request.get(`/api/tasks/${taskId}`, {
      headers: authHeaders,
    })
    expect(getRes.status()).toBe(200)
    const fetchedTask = await getRes.json()
    expect(fetchedTask.id).toBe(taskId)
    expect(fetchedTask.title).toBe('Tarefa de Jornada Playwright')

    // 3. PATCH /tasks/{id} -> 200 OK (atualiza o status da tarefa)
    const patchRes = await request.patch(`/api/tasks/${taskId}`, {
      headers: authHeaders,
      data: {
        status: 'IN_PROGRESS',
      },
    })
    expect(patchRes.status()).toBe(200)
    const updatedTask = await patchRes.json()
    expect(updatedTask.status).toBe('IN_PROGRESS')

    // 4. GET /tasks -> 200 OK (tarefa aparece na listagem paginada)
    const listRes = await request.get('/api/tasks', {
      headers: authHeaders,
    })
    expect(listRes.status()).toBe(200)
    const listData = await listRes.json()
    expect(listData.items).toBeInstanceOf(Array)
    const found = listData.items.some((item: { id: string }) => item.id === taskId)
    expect(found).toBe(true)

    // 5. DELETE /tasks/{id} -> 204 No Content (exclusão lógica)
    const deleteRes = await request.delete(`/api/tasks/${taskId}`, {
      headers: authHeaders,
    })
    expect(deleteRes.status()).toBe(204)

    // 6. GET /tasks/{id} -> 404 Not Found (confirma que o soft delete excluiu da consulta)
    const getAfterDeleteRes = await request.get(`/api/tasks/${taskId}`, {
      headers: authHeaders,
    })
    expect(getAfterDeleteRes.status()).toBe(404)
    const errorData = await getAfterDeleteRes.json()
    expect(errorData.code).toBe('TASK_NOT_FOUND')
  })

  test('should reject request without x-api-key header (401 Unauthorized)', async ({ request }) => {
    // 7. GET /tasks (sem x-api-key) -> 401 Unauthorized (segurança global)
    const unauthRes = await request.get('/api/tasks')
    expect(unauthRes.status()).toBe(401)
  })

  test('should return 400 when task id is not a valid UUID', async ({ request }) => {
    // 8. GET /tasks/uuid-invalido -> 400 Bad Request (validação do pipe de UUID)
    const invalidIdRes = await request.get('/api/tasks/uuid-invalido', {
      headers: authHeaders,
    })
    expect(invalidIdRes.status()).toBe(400)
    const errorData = await invalidIdRes.json()
    expect(errorData.code).toBe('VALIDATION_ERROR')
  })
})

import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { describe, expect, it } from 'vitest'
import { ListTasksQueryDto } from './list-tasks-query.dto'

describe('ListTasksQueryDto', () => {
  it('should validate successfully with empty object', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {})
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate successfully and transform numeric strings', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {
      page: '2',
      pageSize: '25',
    })
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
    expect(dto.page).toBe(2)
    expect(dto.pageSize).toBe(25)
  })

  it('should reject negative page', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {
      page: -1,
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('page')
  })

  it('should reject pageSize less than 1', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {
      pageSize: 0,
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('pageSize')
  })

  it('should reject pageSize greater than 100', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {
      pageSize: 101,
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('pageSize')
  })

  it('should reject non-integer page', async () => {
    const dto = plainToInstance(ListTasksQueryDto, {
      page: 'not-a-number',
    })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('page')
  })
})

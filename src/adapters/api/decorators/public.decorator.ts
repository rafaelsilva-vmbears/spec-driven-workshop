import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Decorator para marcar rotas ou controllers como públicos,
 * ignorando a validação global de autenticação por API Key.
 */
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true)

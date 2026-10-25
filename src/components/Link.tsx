import type { AnchorHTMLAttributes } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

export function Link({ to, ...rest }: Props) {
  return <a href={`#${to}`} {...rest} />
}

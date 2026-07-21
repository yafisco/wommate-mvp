import React from 'react'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  clean = false,
  ...props
}) => {
  const containerClass = clean
    ? className
    : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`

  return (
    <div className={containerClass} {...props}>
      {children}
    </div>
  )
}
export default Container

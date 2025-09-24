import React from 'react';

export default function ShinyText({
  children,
  as: Component = 'span',
  className = '',
  ...rest
}) {
  return (
    <Component className={`shiny-text ${className}`} {...rest}>
      <span className="shiny-text__inner">{children}</span>
    </Component>
  );
}

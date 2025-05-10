"use client";

import React, { useEffect } from 'react';

interface PageHeaderTitleProps {
  title: string;
  description?: string;
  showTitle?: boolean;
}

export function PageHeaderTitle({ title, description, showTitle = true }: PageHeaderTitleProps) {
  useEffect(() => {
    document.title = `${title} - SheSafe`;
  }, [title]);

  if (!showTitle) {
    return null;
  }

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

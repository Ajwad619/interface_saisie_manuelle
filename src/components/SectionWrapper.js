import React from 'react';

export default function SectionWrapper({ children, className = "" }) {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className={`form-section ${className}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container my-5">
      <h1>Interact with library</h1>
      <div className="mt-5">
        <Link to="/library" className="btn btn-primary">
          Go to library
        </Link>
      </div>
      {/*<h1>LimeAcademy examples</h1>*/}
      {/*<div className="mt-5">*/}
      {/*  <Link to="/styleguide" className="btn btn-primary">*/}
      {/*    See styleguide*/}
      {/*  </Link>*/}
      {/*</div>*/}
    </div>
  );
}

export default Home;

import React from "react";

const DataCard = ({ climateInfo, climatezone }) => {
  return (
    <div className="relative mt-2 bg-white rounded-md shadow-lg p-2 ">
      <p>Based on your postcode your are at {climatezone} climate</p>
    </div>
  );
};

export default DataCard;

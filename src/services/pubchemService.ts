export interface PubChemCompound {
  cid: number;
  smiles: string;
  iupacName: string;
  formula: string;
  weight: number;
  name: string;
}

export async function fetchDrugFromPubChem(drugName: string): Promise<PubChemCompound> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
    drugName
  )}/property/IsomericSMILES,IUPACName,MolecularFormula,MolecularWeight/JSON`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Drug "${drugName}" not found in PubChem database.`);
    }
    throw new Error("Failed to fetch data from PubChem API.");
  }

  const data = await response.json();

  if (
    !data.PropertyTable ||
    !data.PropertyTable.Properties ||
    data.PropertyTable.Properties.length === 0
  ) {
    throw new Error(`No property data available for "${drugName}".`);
  }

  const prop = data.PropertyTable.Properties[0];

  return {
    cid: prop.CID,
    smiles: prop.IsomericSMILES,
    iupacName: prop.IUPACName,
    formula: prop.MolecularFormula,
    weight: prop.MolecularWeight,
    name: drugName.charAt(0).toUpperCase() + drugName.slice(1).toLowerCase(),
  };
}

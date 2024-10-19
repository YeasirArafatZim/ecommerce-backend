
const searchInDataset = (dataset, keyToCheck) => {
  for (index in dataset) {
    if (dataset[index].token === keyToCheck) {
      return dataset[index];
    }
  }
}



exports.searchInDataset = searchInDataset;
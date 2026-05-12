<div align="center">

# 🧪 ADMET-Net + ADME-Bot

### AI-Powered Drug Safety Prediction & Analysis Platform

*Developed in collaboration with **Aurigene Pharmaceutical Services** | AIDD Group*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-admebot.netlify.app-14B8A6?style=for-the-badge)](https://admebot.netlify.app)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11.0-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> **"Drug discovery costs $2.8 billion and takes 15 years. Most failures happen because toxic molecules aren't caught early enough. ADMET-Net screens drug candidates for 12 danger signals simultaneously — before any lab testing begins."**

<br/>

![ADME-Bot Screenshot](images/Screenshot%202026-05-11%20104751.png)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Model Architecture](#-model-architecture)
- [ADMET Properties Predicted](#-admet-properties-predicted)
- [Results & Performance](#-results--performance)
- [ADME-Bot — Web Application](#-adme-bot--web-application)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Dataset](#-dataset)
- [Tech Stack](#-tech-stack)
- [Acknowledgements](#-acknowledgements)

---

## 🔬 Overview

This repository contains two tightly integrated components:

| Component | Description |
|-----------|-------------|
| **ADMET-Net** | A multi-task Graph Neural Network that predicts 12 ADMET properties from molecular SMILES strings |
| **ADME-Bot** | A deployed web application where anyone can type a drug name and instantly receive its full ADMET safety profile, explained in plain English |

This project was developed as part of an internship at **Aurigene Pharmaceutical Services**, a leading drug discovery company. The goal: build an AI-first pre-screening tool that helps medicinal chemists identify dangerous molecules *before* they reach the lab.

---

## 🚨 The Problem

In traditional drug discovery:

- Testing a single molecule for toxicity in a lab costs **thousands of dollars** and takes **weeks**
- Companies often have **10,000+ candidate molecules** to screen
- Existing computational tools give a **single score with no explanation** — researchers call this the "black box problem"
- A score of `0.87 danger` is useless without knowing *why*

**Result:** Toxic molecules slip through early screening, causing failures in Phase II/III clinical trials — the most expensive stage of drug development.

---

## 💡 Our Solution

**ADMET-Net** is a Graph Neural Network that:

1. Takes a **SMILES string** (a text representation of a molecule's chemical structure) as input
2. Converts it into a **molecular graph** where atoms are nodes and bonds are edges
3. Uses **Graph Attention Networks (GATv2)** to learn structural patterns associated with toxicity
4. Simultaneously predicts **12 ADMET properties** in a single forward pass
5. Provides **feature-level explanations** via SHAP / Integrated Gradients — showing *which atoms* caused the prediction

**ADME-Bot** sits on top of this, giving the tool a face:
- A pharmacist types `"Metformin"` → the bot fetches the molecule from PubChem → runs the analysis → returns a plain-English safety report

---

## 🧠 Model Architecture

```
SMILES String
      │
      ▼
 RDKit Featurizer
(atom features: 79-dim, bond features: 12-dim)
      │
      ▼
 ┌─────────────────────────────┐
 │      GATv2Conv Layer 1      │  (128 hidden dims, 8 attention heads)
 │         BatchNorm           │
 │           ReLU              │
 └─────────────────────────────┘
      │
      ▼
 ┌─────────────────────────────┐
 │      GATv2Conv Layer 2      │  (256 hidden dims, 8 attention heads)
 │         BatchNorm           │
 │           ReLU              │
 └─────────────────────────────┘
      │
      ▼
 ┌─────────────────────────────┐
 │      GATv2Conv Layer 3      │  (256 hidden dims)
 │     Residual Connection     │
 └─────────────────────────────┘
      │
      ▼
 Global Mean Pool + Global Max Pool
      │
      ▼
 ┌─────────────────────────────┐
 │     Shared MLP Encoder      │  (512 → 256 dims)
 │       Dropout (0.3)         │
 └─────────────────────────────┘
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
 8 Classification Heads                   4 Regression Heads
 (hERG, AMES, DILI, BBB,                 (Caco-2, LogP,
  CYP3A4, CYP2C9, CYP2D6,                Half-life, Clearance)
  Bioavailability)
```

**Key design choices:**
- **Multi-task learning** — training on 12 tasks simultaneously allows sparse tasks (e.g. DILI with 2% label density) to benefit from data-rich tasks (e.g. hERG with 59% label density)
- **Scaffold-based splitting** — test molecules are structurally dissimilar from training molecules (Tanimoto similarity < 0.4), ensuring honest evaluation
- **GATv2 over GAT** — GATv2 fixes the "static attention" problem in vanilla GAT, producing dynamic attention that depends on both source and target node features

---

## 📊 ADMET Properties Predicted

| Category | Property | Type | Description |
|----------|----------|------|-------------|
| **Absorption** | Caco-2 Permeability | Regression | Intestinal membrane permeability |
| **Absorption** | Oral Bioavailability | Classification | Whether the drug reaches systemic circulation |
| **Distribution** | LogP | Regression | Lipophilicity / membrane partitioning |
| **Distribution** | BBB Penetration | Classification | Blood-brain barrier crossing |
| **Metabolism** | CYP3A4 Inhibition | Classification | Major drug metabolism enzyme |
| **Metabolism** | CYP2C9 Inhibition | Classification | Drug-drug interaction risk |
| **Metabolism** | CYP2D6 Inhibition | Classification | Codeine/antidepressant metabolism |
| **Excretion** | Half-life | Regression | Time for drug concentration to halve |
| **Excretion** | Clearance | Regression | Rate of drug elimination |
| **Toxicity** | hERG Cardiotoxicity | Classification | Heart rhythm disruption risk |
| **Toxicity** | AMES Mutagenicity | Classification | DNA-damaging / cancer risk |
| **Toxicity** | DILI Liver Injury | Classification | Drug-induced liver damage |

---

## 📈 Results & Performance

### Final Test Set Metrics

| Task | Type | Test Samples | Metric | Score |
|------|------|-------------|--------|-------|
| hERG | Classification | 1,545 | AUC | **0.831** |
| AMES | Classification | 566 | AUC | **0.937** ⭐ |
| DILI | Classification | 63 | AUC | **0.838** |
| BBB | Classification | 210 | AUC | **0.710** |
| Caco-2 | Regression | 63 | RMSE | **0.580** |
| LogP | Regression | 83 | RMSE | **1.574** |

> ⭐ AMES AUC of **0.937** is particularly strong — the model correctly identifies 94% of mutagenic molecules.

### ROC Curves

![ROC Curves](results/figures/roc_curves.png)

### Training History

![Training Curves](results/figures/training_curves.png)

The model converged at **epoch 3** (early stopping). Training loss continued decreasing while validation loss plateaued — the best checkpoint was saved automatically.

### Confusion Matrices

![Confusion Matrices](results/figures/confusion_matrices.png)

### SHAP Feature Importance (hERG Cardiotoxicity)

![SHAP](results/figures/shap_herg_top30.png)

**FP bit 935** is the single most predictive molecular fingerprint feature for hERG cardiotoxicity — by a significant margin. This gives medicinal chemists a concrete structural flag to watch for.

### Chemical Space (UMAP)

![UMAP](results/figures/output1.png)

Cardiotoxic molecules (orange) are distributed across all regions of chemical space — proving that simple rule-based filtering fails, and a GNN that understands molecular structure is necessary.

### Inter-Task Correlation

![Correlation Heatmap](results/figures/task_correlation_heatmap.png)

Most tasks are weakly correlated, justifying the multi-task approach. Notable: Caco-2 and DILI show a -0.34 correlation — molecules with high intestinal permeability tend to have slightly lower liver toxicity risk.

---

## 🌐 ADME-Bot — Web Application

**Live at: [https://admebot.netlify.app](https://admebot.netlify.app)**

![ADME-Bot Demo](images/Screenshot%202026-05-11%20104848.png)

### How it works

```
User types "Ibuprofen"
        │
        ▼
PubChem REST API
→ Fetches SMILES, formula, molecular weight, structure image
        │
        ▼
Gemini AI
→ Generates full ADMET profile in structured JSON
        │
        ▼
Clean UI Report
→ Absorption / Distribution / Metabolism / Excretion
→ hERG / AMES / DILI toxicity ratings
→ Plain-English clinical summary
```

### Features

- 🔍 **Drug name lookup** — no need to know SMILES strings
- 🧬 **Molecular structure visualization** — fetched directly from PubChem
- 📋 **Full ADMET breakdown** — all 4 pharmacokinetic categories
- 🛡️ **Toxicity ratings** — color-coded Safe / Caution / Risk
- 💬 **Plain-English summary** — written for pharmacists, not just researchers
- ⚡ **Quick analysis chips** — one-click for common drugs

![ADME-Bot Clinical Summary](images/Screenshot%202026-05-11%20104905.png)

---

## 📁 Project Structure

```
ADMET-Net/
│
├── data/
│   ├── raw/                        # Raw CSV datasets (from MoleculeNet via DeepChem)
│   │   ├── tox21.csv               # AMES mutagenicity
│   │   ├── herg_central.csv        # hERG cardiotoxicity (12,000+ molecules)
│   │   ├── bbb_martins.csv         # Blood-brain barrier
│   │   ├── dili.csv                # Drug-induced liver injury
│   │   ├── caco2_wang.csv          # Intestinal permeability
│   │   ├── esol.csv                # Aqueous solubility (logP proxy)
│   │   └── cyp_p450_2d6_inhibition.csv
│   └── processed/                  # Featurized PyG Data objects
│
├── src/
│   ├── model.py                    # ADMET-Net GNN architecture (GATv2Conv)
│   ├── featurizer.py               # SMILES → molecular graph (RDKit + PyG)
│   ├── dataset.py                  # Multi-task dataset with scaffold splitting
│   ├── trainer.py                  # Training loop with early stopping
│   └── predict.py                  # Inference script for new molecules
│
├── notebooks/
│   ├── 01_EDA_and_Featurization.ipynb    # Exploratory data analysis
│   ├── 02_Model_Training.ipynb           # Training experiments
│   └── 03_Evaluation_and_SHAP.ipynb      # Evaluation, ROC curves, SHAP
│
├── models/
│   └── admet_net_best.pt           # Best model checkpoint (epoch 3)
│
├── results/
│   ├── figures/                    # All generated plots
│   │   ├── training_curves.png
│   │   ├── roc_curves.png
│   │   ├── confusion_matrices.png
│   │   ├── shap_herg_top30.png
│   │   └── task_correlation_heatmap.png
│   └── metrics_summary.csv         # Final test set performance table
│
├── adme-bot/                       # Web application (React + Vite)
│   ├── src/
│   │   ├── App.tsx                 # Main UI component
│   │   ├── services/
│   │   │   ├── geminiService.ts    # AI analysis calls
│   │   │   └── pubchemService.ts   # PubChem API integration
│   │   └── index.css
│   └── netlify/functions/          # Serverless API proxy
│
├── config.yaml                     # Training hyperparameters
├── requirements.txt                # Python dependencies
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- CUDA-capable GPU (recommended for training; CPU works for inference)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/admet-net.git
cd admet-net
```

### 2. Create Python environment

```bash
conda create -n admet python=3.10
conda activate admet
```

### 3. Install Python dependencies

```bash
pip install torch==2.11.0
pip install torch-geometric==2.7.0
pip install rdkit
pip install deepchem
pip install shap
pip install pandas numpy matplotlib seaborn scikit-learn
pip install jupyter
```

### 4. Download datasets

```bash
python data/download_datasets.py
```

This downloads 7 datasets (~23,000 molecules total) from MoleculeNet via DeepChem.

### 5. Run the web app locally

```bash
cd adme-bot
npm install
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

---

## 🚀 Usage

### Run inference on a molecule

```bash
python src/predict.py \
  --checkpoint models/admet_net_best.pt \
  --smiles "CC(=O)Nc1ccc(O)cc1"
```

**Output:**
```
============================================================
  ADMET Profile | Aurigene AIDD
  Drug: Paracetamol (Acetaminophen)
  SMILES: CC(=O)Nc1ccc(O)cc1
============================================================
  [Absorption]
    🟢 Caco-2 Permeability     : 0.823 ± 0.041
    🟢 Oral Bioavailability    : Positive (p=0.734)
  [Distribution]
    🟢 LogP                    : 0.912 ± 0.023
    🟢 BBB Penetration         : Negative (p=0.187)
  [Toxicity]
    🟢 hERG Cardiotoxicity     : Negative (p=0.124)
    🟢 AMES Mutagenicity       : Negative (p=0.089)
    🟡 DILI Liver Toxicity     : Positive (p=0.612)
============================================================
```

### Train from scratch

```bash
python src/trainer.py --config config.yaml
```

### Run evaluation notebook

```bash
jupyter notebook notebooks/03_Evaluation_and_SHAP.ipynb
```

---

## 📦 Dataset

All datasets are sourced from **MoleculeNet** via DeepChem (open-source, free for research):

| Dataset | Task | Molecules | Source |
|---------|------|-----------|--------|
| Tox21 | AMES mutagenicity | 7,831 | MoleculeNet |
| hERG Central | Cardiotoxicity | 12,000+ | MoleculeNet |
| BBBP | Blood-brain barrier | 2,039 | MoleculeNet |
| DILI | Liver injury | 475 | MoleculeNet |
| Caco-2 Wang | Permeability | 906 | MoleculeNet |
| ESOL (Delaney) | LogP / Solubility | 1,128 | MoleculeNet |
| CYP P450 2D6 | Metabolism | 13,427 | MoleculeNet |

**Total: ~23,000 unique molecules**

Scaffold-based splitting (Bemis-Murcko) ensures test molecules are structurally distinct from training molecules, preventing data leakage.

---

## 🛠️ Tech Stack

### Model (Backend)
| Tool | Version | Purpose |
|------|---------|---------|
| PyTorch | 2.11.0 | Deep learning framework |
| PyTorch Geometric | 2.7.0 | Graph neural network operations |
| RDKit | Latest | Molecular featurization & cheminformatics |
| DeepChem | Latest | Dataset loading from MoleculeNet |
| SHAP | Latest | Model explainability |
| Scikit-learn | Latest | Metrics & evaluation |
| NumPy / Pandas | Latest | Data processing |
| Matplotlib / Seaborn | Latest | Visualization |

### Web Application (Frontend)
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| Lucide React | Latest | Icons |
| Gemini API | Latest | AI-powered analysis |
| PubChem REST API | — | Molecule lookup |
| Netlify | — | Deployment & serverless functions |

---

## 🏥 Clinical Relevance

This tool is designed for use by:

- **Medicinal chemists** — early-stage drug candidate screening
- **Pharmaceutical researchers** — prioritizing molecules for synthesis
- **Pharmacists** — understanding drug safety profiles
- **Students** — learning ADMET concepts interactively

> ⚠️ **Disclaimer:** ADMET-Net is a research tool and should not be used as the sole basis for clinical or regulatory decisions. All predictions should be validated with experimental data.

---

## 🙏 Acknowledgements

- **Aurigene Pharmaceutical Services, Hyderabad** — for providing the research environment, domain guidance, and real-world pharmaceutical context for this project
- **MoleculeNet / DeepChem** — for the open-source ADMET benchmark datasets
- **Bemis & Murcko (1996)** — for the scaffold-based splitting methodology
- **Veličković et al.** — for the Graph Attention Network architecture
- **Brody et al. (2022)** — for the GATv2 improvement

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for pharmaceutical research**

[🌐 Live Demo](https://admebot.netlify.app) · [📧 Contact](mailto:padmabusiness10@email.com) 

</div>
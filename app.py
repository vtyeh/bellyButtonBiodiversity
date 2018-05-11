# Import Dependencies
import pandas as pd 
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import datetime as dt
from flask import Flask, jsonify, render_template

# Create the connection engine
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
conn = engine.connect()

# Use SQLAlchemy `automap_base()` to reflect your tables into classes
Base = automap_base()
Base.prepare(engine, reflect=True)

# Save a reference to those classes called `Station` and `Measurement`
otu = Base.classes.otu
samples = Base.classes.samples
samples_metadata = Base.classes.samples_metadata

# Create a session for the engine to manipulate data
session = Session(engine)

app = Flask(__name__)

@app.route('/')
def index():
    """Return the dashboard homepage"""
    return render_template('index.html')

@app.route('/names')
def getNames():
    """Returns a list of sample names"""
    
    name_query = session.query(samples_metadata.SAMPLEID).all()
    names_list = list(np.ravel(name_query))
    names = []
    for name in names_list:
        names.append(f"BB_{name}")
    return jsonify(names)

@app.route('/otu')
def getDescriptions():
    """Return list of OTU descriptions"""
    description_query = session.query(otu.lowest_taxonomic_unit_found).all()
    description_list = list(np.ravel(description_query))
    return jsonify(description_list)

@app.route('/metadata/<sample>')
def get_metaData(sample):
    """Return json dictionary of selected sample metadata"""
    search_sample = sample[3:]
    metadata_query = session.query(samples_metadata.AGE, samples_metadata.BBTYPE, samples_metadata.ETHNICITY,\
                                   samples_metadata.GENDER, samples_metadata.LOCATION, samples_metadata.SAMPLEID)\
                                    .filter(samples_metadata.SAMPLEID == search_sample).first()
    metadata_info = list(np.ravel(metadata_query))
    metadata_dict = {}
    metadata_dict["AGE"] = metadata_info[0]
    metadata_dict["BBTYPE"] = metadata_info[1]
    metadata_dict["ETHNICITY"] = metadata_info[2]
    metadata_dict["GENDER"] = metadata_info[3]
    metadata_dict["LOCATION"] = metadata_info[4]
    metadata_dict["SAMPLEID"] = metadata_info[5]
    
    return jsonify(metadata_dict)

@app.route('/wfreq/<sample>')
def weeklyWashFreq(sample):
    """Return Weekly Washing Frequency as an integer value"""
    search_sample = sample[3:]
    wash_query = session.query(samples_metadata.WFREQ).filter(samples_metadata.SAMPLEID == search_sample).first()
    wfreq = list(np.ravel(wash_query))
    return jsonify(int(wfreq[0]))

@app.route('/samples/<sample>')
def otu_values(sample):
    """Return otu ids and sample values for a given sample"""

    otu_query = session.query(samples.otu_id, getattr(samples, sample)).order_by(getattr(samples, sample).desc()).all()
    otuValues = []
    id_list = []
    values_list = []
    otuValues_dict = {}
    for x in otu_query:
        (otu_ids, sample_values) = x
        id_list.append(otu_ids)
        values_list.append(sample_values)
    otuValues_dict["otu_ids"] = id_list
    otuValues_dict["sample_values"] = values_list
    otuValues.append(otuValues_dict)

    return jsonify(otuValues)


if __name__ == "__main__":
    app.run(debug=True)
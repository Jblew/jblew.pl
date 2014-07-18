<?xml version="1.0" encoding="UTF-8"?>

<!--
    Document   : stylesheet.xsl
    Created on : 30 kwiecień 2013, 19:16
    Author     : jblew
    Description:
        Kosma document stylesheet
-->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    
    <xsl:template match="/kosma-document">
        <div class="kosma-document" id="page-content">
            <div> 
                <h1>
                    <xsl:value-of select="@title" />
                </h1>
                <p>
                    <xsl:apply-templates />
                </p>
                <hr />
                <small class="post-footer">Data: 
                    <xsl:value-of select="@date" />
                </small>
            </div>
        </div>
    </xsl:template>
    
    <xsl:template match="paragraph">
        <p>
            <xsl:apply-templates />
        </p>
    </xsl:template>
    
    <xsl:template match="kosma-insert-comment">
        <xsl:comment>
            <xsl:apply-templates />
        </xsl:comment>
    </xsl:template>
    
    <xsl:template match="titled-paragraph">
        <h3>
            <xsl:value-of select="@title" />
        </h3>
        <p>
            <xsl:apply-templates />
        </p>
    </xsl:template>
    
    <xsl:template match="ordered-list">
        <ol>
            <xsl:apply-templates />
        </ol>
    </xsl:template>
    
    <xsl:template match="unordered-list">
        <ul>
            <xsl:apply-templates />
        </ul>
    </xsl:template>
    
    <xsl:template match="element">
        <li>
            <xsl:apply-templates />
        </li>
    </xsl:template>
    
    <xsl:template match="bold">
        <strong>
            <xsl:apply-templates />
        </strong>
    </xsl:template>
    
    <xsl:template match="italic">
        <i>
            <xsl:apply-templates />
        </i>
    </xsl:template>
    
    <xsl:template match="inline-code">
        <code>
            <xsl:apply-templates />
        </code>
    </xsl:template>
    
    <xsl:template match="code-block">
        <pre class="code-block">
            <xsl:apply-templates />
        </pre>
    </xsl:template>
    
    <xsl:template match="label-success">
        <span class="label label-success">
            <xsl:apply-templates />
        </span>
    </xsl:template>
    
    <xsl:template match="label-error">
        <span class="label label-error">
            <xsl:apply-templates />
        </span>
    </xsl:template>
    
    <xsl:template match="label-warning">
        <span class="label label-warning">
            <xsl:apply-templates />
        </span>
    </xsl:template>
    
    <xsl:template match="quote">
        <blockquote>
            <xsl:apply-templates />
        </blockquote>
    </xsl:template>
    
    <xsl:template match="quote-right">
        <blockquote class="pull-right">
            <xsl:apply-templates />
        </blockquote>
    </xsl:template>
    
    <xsl:template match="link">
        <a>
            <xsl:attribute name="href">
                <xsl:value-of select="@url" />
            </xsl:attribute>
            <xsl:apply-templates />
        </a>
    </xsl:template>
    
    <xsl:template match="image">
        <a>
            <xsl:attribute name="href">
                <xsl:value-of select="@url" />
            </xsl:attribute>
            <xsl:attribute name="class">highslide</xsl:attribute>
            <xsl:attribute name="onclick">return hs.expand(this, { slideshowGroup: 1});</xsl:attribute>
            <img class="img-polaroid">
                <xsl:attribute name="src">
                    <xsl:value-of select="@url" />
                </xsl:attribute>
                <xsl:attribute name="width">
                    <xsl:value-of select="@width" />
                </xsl:attribute>
                <xsl:attribute name="title">
                    <xsl:value-of select="@title" />
                </xsl:attribute>
                <xsl:attribute name="alt">
                    <xsl:value-of select="@alt" />
                </xsl:attribute>
            </img>
        </a>
    </xsl:template>
</xsl:stylesheet>